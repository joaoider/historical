import {
    useEffect,
    useState
} from "react";


import api from "./services/api";

import Timeline from "./components/Timeline";


function App() {


    const [timeline, setTimeline] = useState([]);



    useEffect(() => {


        api.get("/timeline")

            .then(response => {

                setTimeline(response.data);

            });


    }, []);



    return (

        <div>

            <h1>
                Linha do Tempo Histórica
            </h1>


            <Timeline
                entities={timeline}
            />


        </div>

    );

}


export default App;