import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { SDMXParser } from "@yogender.s/parser/dist/parser";
import { getHighChartsData } from "../highcharts";

const SingleLine = () => {
  const [data, setData] = useState([]);
  const sdmx = new SDMXParser();
  useEffect(() => {
    (async () => {
      await sdmx.getDatasets(
        "https://stats-nsi-stable.pacificdata.org/rest/data/SPC,DF_COMMODITY_PRICES,1.0/M.COCONUT_OIL.COMPRICE?startPeriod=2010-01&endPeriod=2022-04&dimensionAtObservation=AllDimensions&format=jsondata"
      );
      const data = sdmx.getData();
      const [yAxis, xAxis] = await getHighChartsData(
        data,
        "line",
        "TIME_PERIOD",
        "value"
      );
      setData([yAxis, xAxis]);
    })();
  }, []);
  const [yAxis, xAxis] = data;
  const options = {
    title: {
      text: "Price of Coconut Oil",
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
        text: "USD / mt",
      },
    },

    series: [
      {
        name: "Coconut Oil",
        data: yAxis,
      },
    ],

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

export default SingleLine;
