import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { SDMXParser } from "@yogender.s/parser";
import { getHighChartsData } from "@yogender.s/parser/highcharts";

const Pyramid = () => {
  const [data, setData] = useState([]);
  const sdmx = new SDMXParser();
  useEffect(() => {
    (async () => {
      await sdmx.getDatasets(
        "https://stats-nsi-stable.pacificdata.org/rest/data/SPC,DF_POP_PROJ,3.0/A.CK.MIDYEARPOPEST.F+M.Y70T999+Y65T69+Y60T64+Y55T59+Y50T54+Y45T49+Y40T44+Y35T39+Y30T34+Y25T29+Y20T24+Y15T19+Y10T14+Y05T09+Y00T04?startPeriod=2015&endPeriod=2050&dimensionAtObservation=AllDimensions&format=jsondata"
      );
      const data = await sdmx.getData();
      const [seriesData, xAxis] = await getHighChartsData(
        data,
        "pyramid",
        "AGE",
        "value",
        "SEX"
      );
      seriesData[0].data = seriesData[0].data.map((item) => {
        return -Math.abs(item);
      });
      setData([seriesData, xAxis]);
    })();
  }, []);

  const [seriesData, xAxis] = data;
  const options = {
    chart: {
      type: "bar",
    },
    title: {
      text: "Cook Islands",
      align: "center",
    },

    subtitle: {
      text: 'Source: <a href="https://irecusa.org./programs/solar-jobs-census/" target="_blank">PDH.stat</a>',
      align: "center",
    },

    xAxis: [
      {
        categories: xAxis,
        reversed: false,
        labels: {
          step: 1,
        },
      },
      {
        // mirror axis on right side
        opposite: true,
        reversed: false,
        categories: xAxis,
        linkedTo: 0,
        labels: {
          step: 1,
        },
      },
    ],
    yAxis: {
      title: {
        text: null,
      },
      labels: {
        formatter: function () {
          return Math.abs(this.value);
        },
      },
    },
    plotOptions: {
      series: {
        stacking: "normal",
      },
    },

    tooltip: {
      formatter: function () {
        return (
          "<b>" +
          this.series.name +
          ", age " +
          this.point.category +
          "</b><br/>" +
          "Population: " +
          Highcharts.numberFormat(Math.abs(this.point.y), 2)
        );
      },
    },
    series: seriesData,
  };
  return (
    <>
      <HighchartsReact highcharts={Highcharts} options={options} />
    </>
  );
};

export default Pyramid;
