import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { SDMXParser } from "@yogender.s/parser";
import { getHighChartsData } from "../highcharts";

const MultiColumn = () => {
  const [data, setData] = useState([]);
  const sdmx = new SDMXParser();
  useEffect(() => {
    (async () => {
      await sdmx.getDatasets(
        `https://stats-nsi-stable.pacificdata.org/rest/data/SPC,DF_VAW,1.0/A..VAW_TOPIC_001......PARTNER.ALOLIFE.....?lastNObservations=1&dimensionAtObservation=AllDimensions&format=jsondata`
      );
      const data = sdmx.getData();
      const [seriesData, xAxis] = await getHighChartsData(
        data,
        "multiColumn",
        "GEO_PICT",
        "value",
        "VIOLENCE_TYPE"
      );
      setData([seriesData, xAxis]);
    })();
  }, []);

  const [seriesData, xAxis] = data;
  const options = {
    chart: {
      type: "column",
    },
    title: {
      text: "Voilence against women",
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
      title: {
        text: "Number of persons in relative frequency",
      },
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
};

export default MultiColumn;
