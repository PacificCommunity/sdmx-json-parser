import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { SDMXParser } from "sdmx-json-parser"
import { getHighChartsData } from "../highcharts";

const Column = () => {
  const [data, setData] = useState([]);
  const [seriesData, setSeriesData] = useState([]);
  const sdmx = new SDMXParser();
  useEffect(() => {
    (async () => {
      await sdmx.getDatasets(
        //"https://stats-nsi-stable.pacificdata.org/rest/data/SPC,DF_WASTE,1.0/..SOLIDWASTEPC.?dimensionAtObservation=AllDimensions&format=jsondata"
        "https://www.ilo.org/sdmx/rest/data/ILO,DF_EMP_TEMP_SEX_AGE_STE_NB,1.0/CHL.A..SEX_T.AGE_YTHADULT_YGE15.STE_ICSE93_6+STE_ICSE93_5+STE_ICSE93_4+STE_ICSE93_3+STE_ICSE93_2+STE_ICSE93_1?endPeriod=2022&lastNObservations=1"
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
      title: {
        text: "TON",
      },
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
