import React, { useEffect, useState } from 'react'
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { SDMXParser } from '@yogender.s/parser';
import { getHighChartsData } from '@yogender.s/parser/highcharts';
const MultiLine = () => {

    const [data,setData] = useState([])
    const sdmx = new SDMXParser();
    useEffect(()=>{

        (async()=>{
            await sdmx.getDatasets(
                  "https://stats-nsi-stable.pacificdata.org/rest/data/SPC,DF_CROPS,1.0/A..5510.136?dimensionAtObservation=AllDimensions&format=jsondata"
                );
                const data = await sdmx.getData();  
                const res = await sdmx.getAnnotations();
                console.log("🚀 ~ file: MultiLine.jsx:18 ~ res:", res)
                const [seriesData,xAxis] = await getHighChartsData(data, "multiLine","TIME_PERIOD","value","GEO_PICT");
             setData([seriesData,xAxis])
           })()
    },[])
    const [seriesData,xAxis] = data

    const options = {
      title: {
        text: "Taro Production (Tonnes)",
        align: "center",
      },
  
      subtitle: {
        text: 'Source: <a href="https://irecusa.org./programs/solar-jobs-census/" target="_blank">PDH.stat (FAOSTAT)</a>',
        align: "center",
      },
  
      xAxis: {
        categories: xAxis,
      },
      legend: {
        layout: "vertical",
        align: "right",
        verticalAlign: "middle",
      },
  
      series: seriesData,
  
      responsive: {
        rules: [
          {
            condition: {
              maxWidth: 500,
            },
            chartOptions: {
              legend: {
                layout: "horizontal",
                align: "center",
                verticalAlign: "bottom",
              },
            },
          },
        ],
      },
    };
    return (
      <>
        <HighchartsReact highcharts={Highcharts} options={options} />
      </>
    );
}

export default MultiLine