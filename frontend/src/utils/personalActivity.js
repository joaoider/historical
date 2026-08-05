export function recordRecommendationActivity(item, areaPath) {
    if (!item?.category || !["videos", "podcasts"].includes(item.category)) return;
    let current;
    try { current = JSON.parse(window.localStorage.getItem("ider-recommendation-activity") || "[]"); } catch { current = []; }
    const next = [{ category: item.category, title: item.title, source: item.source, url: item.url, areaPath, visitedAt: new Date().toISOString() }, ...current.filter((entry) => !(entry.category === item.category && entry.title === item.title))].slice(0, 30);
    window.localStorage.setItem("ider-recommendation-activity", JSON.stringify(next));
}
