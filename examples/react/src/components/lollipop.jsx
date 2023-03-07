import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { SDMXParser} from "@yogender.s/parser";
import { getHighChartsData } from "@yogender.s/parser/highcharts";
import highchartsLollipop from "highcharts/modules/lollipop";
import HC_more from "highcharts/highcharts-more";
import highchartsDumbbell from "highcharts/modules/dumbbell";

HC_more(Highcharts);
highchartsDumbbell(Highcharts);
highchartsLollipop(Highcharts);
const Lollipop = () => {
  const [data, setData] = useState([]);
  const sdmx = new SDMXParser();
  useEffect(() => {
    (async () => {
      await sdmx.getDatasets(
        "https://stats-nsi-stable.pacificdata.org/rest/data/SPC,DF_NMDI_FIS,1.0/..SPC_14_b_1......?startPeriod=2013&endPeriod=2022&dimensionAtObservation=AllDimensions&format=jsondata"
      );
      const data = await sdmx.getData();
      const seriesData = await getHighChartsData(
        data,
        "lollipop",
        "GEO_PICT",
        "value",
        "Population"
      );
      setData(seriesData);
    })();
  }, []);
  const [seriesData] = data;
  const options = {
    chart: {
      type: "lollipop",
    },
    title: {
      text: "Example Text",
      align: "center",
    },

    subtitle: {
      text: 'Source: <a href="https://irecusa.org./programs/solar-jobs-census/" target="_blank">PDH.stat</a>',
      align: "center",
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

export default Lollipop;
