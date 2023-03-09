import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { SDMXParser } from "@yogender.s/parser";
import { getHighChartsData } from "@yogender.s/parser/highcharts";

const Column = () => {
  const [data, setData] = useState([]);
  const [seriesData, setSeriesData] = useState([]);
  const sdmx = new SDMXParser();
  useEffect(() => {
    (async () => {
      await sdmx.getDatasets(
        "https://stats-nsi-stable.pacificdata.org/rest/data/SPC,DF_WASTE,1.0/..SOLIDWASTEPC.?dimensionAtObservation=AllDimensions&format=jsondata"
      );
      const data = sdmx.getData();
      const [yAxis, xAxis] = await getHighChartsData(
        data,
        "column",
        "GEO_PICT",
        "value"
      );

      const check = data.map((val) => {
        const name = val.GEO_PICT;
        const y = val.value;

        return { name, y };
      });
      setSeriesData(check);
      setData([yAxis, xAxis]);
    })();
  }, []);
  const [yAxis, xAxis] = data;
  const options = {
    chart: {
      type: "column",
    },
    title: {
      text: "Municipal Solid Waste",
      align: "center",
    },

    subtitle: {
      text: 'Source: <a href="https://irecusa.org./programs/solar-jobs-census/" target="_blank">PDH.stat</a>',
      align: "center",
    },

    xAxis: {
      categories: xAxis,
    },

    yAxis: {
        title:{
            text:"TON"
        }
    },
    series: [
      {
        data: yAxis,
      },
    ],
   
  };
  return (
    <>
      <HighchartsReact highcharts={Highcharts} options={options} />
    </>
  );
};

export default Column;
