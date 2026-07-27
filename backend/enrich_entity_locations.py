import json
import sys
import time
from urllib.error import HTTPError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from sqlalchemy import text

from app.database import engine


API_URL = "https://www.wikidata.org/w/api.php"
USER_AGENT = "HistoricalTimeline/1.0 (educational project)"
OBJECT_TRACKS = {"Livros", "Tecnologias", "Obras Pinturas | Esculturas"}


def api_request(parameters):
    url = f"{API_URL}?{urlencode(parameters)}"
    request = Request(url, headers={"User-Agent": USER_AGENT})

    for attempt in range(6):
        try:
            with urlopen(request, timeout=45) as response:
                return json.load(response)
        except HTTPError as error:
            if error.code != 429 or attempt == 5:
                raise
            time.sleep(4 * (attempt + 1))


def search_entity(name):
    for language in ("pt", "en"):
        response = api_request({
            "action": "wbsearchentities",
            "search": name,
            "language": language,
            "uselang": "pt",
            "limit": 1,
            "format": "json",
        })
        if response.get("search"):
            return response["search"][0]["id"]
    return None


def load_entities(entity_ids):
    result = {}
    ids = list(dict.fromkeys(entity_ids))
    for index in range(0, len(ids), 40):
        batch = ids[index:index + 40]
        response = api_request({
            "action": "wbgetentities",
            "ids": "|".join(batch),
            "props": "claims|labels",
            "languages": "pt|en",
            "format": "json",
        })
        result.update(response.get("entities", {}))
        time.sleep(0.4)
    return result


def claim_item(entity, property_id):
    try:
        return entity["claims"][property_id][0]["mainsnak"]["datavalue"]["value"]["id"]
    except (KeyError, IndexError, TypeError):
        return None


def coordinates(entity):
    try:
        value = entity["claims"]["P625"][0]["mainsnak"]["datavalue"]["value"]
        return float(value["latitude"]), float(value["longitude"])
    except (KeyError, IndexError, TypeError, ValueError):
        return None


def label(entity):
    labels = entity.get("labels", {})
    return (labels.get("pt") or labels.get("en") or {}).get("value")


def main():
    selected_track = sys.argv[1] if len(sys.argv) > 1 else None
    track_filter = " AND track = :track" if selected_track else ""
    with engine.connect() as connection:
        rows = connection.execute(
            text(
                f"""
                SELECT id, name, track FROM history.entity
                WHERE (latitude IS NULL OR longitude IS NULL)
                {track_filter}
                ORDER BY id
                """
            ),
            {"track": selected_track},
        ).mappings().all()

    matches = {}
    for index, row in enumerate(rows, start=1):
        try:
            qid = search_entity(row["name"])
            if qid:
                matches[row["id"]] = qid
            print(f"[{index}/{len(rows)}] {row['name']}: {qid or 'não encontrado'}")
            time.sleep(0.2)
        except Exception as error:
            print(f"Falha na busca de {row['name']}: {error}")

    subjects = load_entities(matches.values())
    location_by_row = {}
    location_ids = []

    for row in rows:
        subject = subjects.get(matches.get(row["id"]), {})
        if row["track"] in OBJECT_TRACKS:
            location_id = claim_item(subject, "P495") or claim_item(subject, "P17") or claim_item(subject, "P740")
        else:
            location_id = claim_item(subject, "P19") or claim_item(subject, "P27")
        if location_id:
            location_by_row[row["id"]] = location_id
            location_ids.append(location_id)

    locations = load_entities(location_ids)
    country_ids = []
    country_by_location = {}
    for location_id, location in locations.items():
        country_id = claim_item(location, "P17")
        if country_id:
            country_by_location[location_id] = country_id
            country_ids.append(country_id)

    countries = load_entities(country_ids)
    updates = []
    for row in rows:
        location_id = location_by_row.get(row["id"])
        location = locations.get(location_id, {})
        country_id = country_by_location.get(location_id)
        country = countries.get(country_id, {}) if country_id else location
        point = coordinates(location) or coordinates(country)
        if not point:
            continue

        updates.append({
            "id": row["id"],
            "origin_country": label(country) or label(location),
            "latitude": point[0],
            "longitude": point[1],
        })

    with engine.begin() as connection:
        for values in updates:
            connection.execute(
                text(
                    """
                    UPDATE history.entity
                    SET origin_country = :origin_country,
                        latitude = :latitude,
                        longitude = :longitude
                    WHERE id = :id
                    """
                ),
                values,
            )

    print(f"Localizações adicionadas: {len(updates)} de {len(rows)}")


if __name__ == "__main__":
    main()
