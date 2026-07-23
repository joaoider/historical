function Filters({ onFilter }) {


    return (

        <div>


            <button
                onClick={() => onFilter(null)}
            >
                Todos
            </button>


            <button
                onClick={() => onFilter("PERSON")}
            >
                Pessoas
            </button>


            <button
                onClick={() => onFilter("EVENT")}
            >
                Eventos
            </button>


            <button
                onClick={() => onFilter("MOVEMENT")}
            >
                Movimentos
            </button>


        </div>

    );

}


export default Filters;