import { useEffect, useRef } from "react";

import { Timeline } from "vis-timeline/standalone";

import { DataSet } from "vis-data";

import "vis-timeline/styles/vis-timeline-graph2d.min.css";


function TimelineComponent({ entities }) {


    const containerRef = useRef(null);



    useEffect(() => {
        console.log(entities);
        function formatYear(year) {
    if (year < 0) {
        return `${Math.abs(year)} BC`;
    }
            return `${year} AD`;
        }


        const items = new DataSet(
            entities.map(entity => ({
                id: entity.id,
                content: `${entity.name} (${formatYear(entity.start_year)})`,
                start: `${entity.start_year}-01-01`
            }))

        );



        const options = {

            orientation: "top",

            zoomable: true,

            moveable: true,

            minHeight: "400px",

            zoomMin: 1000 * 60 * 60 * 24 * 365 * 3000,

            zoomMax: 1000 * 60 * 60 * 24 * 365 * 5000

        };



        const timeline = new Timeline(

            containerRef.current,

            items,

            options

        );



        return () => {

            timeline.destroy();

        };


    }, [entities]);



    return (

        <div

            ref={containerRef}

            style={{

                height:"400px"

            }}

        />

    );

}


export default TimelineComponent;