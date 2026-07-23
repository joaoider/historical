function EntityCard({ entity }) {

    return (

        <div>

            <h2>
                {entity.name}
            </h2>

            <p>
                Tipo: {entity.entity_type}
            </p>

            <p>
                Período:
                {entity.start_year}
                até
                {entity.end_year}
            </p>

        </div>

    );

}


export default EntityCard;