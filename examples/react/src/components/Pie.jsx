import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { SDMXParser } from "@yogender.s/parser";
import { getHighChartsData } from "@yogender.s/parser/highcharts";

const Pie = () => {
  const [data, setData] = useState([]);
  const sdmx = new SDMXParser();
  useEffect(() => {
    (async () => {
        await sdmx.getDatasets("https://stats-nsi-stable.pacificdata.org/rest/data/SPC,DF_HHEXP,1.0/A.CK.HHEXPPROP._T._T.10+11+12+01+02+03+04+05+06+07+08+09.USD?startPeriod=2013&endPeriod=2015&lastNObservations=1&dimensionAtObservation=AllDimensions&format=jsondata")
        const data = sdmx.getData()
        const datas = await getHighChartsData(data, "pie","","value","COMMODITY");
        const seriesData = [{data:datas}]
      setData(seriesData);
    })();
  }, []);
  const [seriesData] = data;
  const options = {
    chart: {
      type: "pie",
    },
    title: {
      text: "U.S Solar Employment Growth by Job Category, 2010-2020",
      align: "left",
    },

    subtitle: {
      text: 'Source: <a href="https://irecusa.org./programs/solar-jobs-census/" target="_blank">IREC</a>',
      align: "left",
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

export default Pie;
