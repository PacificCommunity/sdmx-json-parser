import { useEffect, useState } from "react";
import { Chart, Series, Subtitle, Title, XAxis, YAxis } from "@highcharts/react";
import { SDMXParser } from "sdmx-json-parser";
import { getHighChartsData } from "../highcharts";

const SingleLine = () => {
  const [data, setData] = useState<any[]>([]);
  useEffect(() => {
    const sdmx = new SDMXParser();
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
  return (
    <Chart >
      <Title align="center">Price of Coconut Oil</Title>
      <Subtitle align="center">
        <>
          Source: <a href="https://irecusa.org./programs/solar-jobs-census/" target="_blank">PDH.stat</a>
        </>
      </Subtitle>
      <Series type="line" data={data[0]} options={{
        name: "Coconut Oil",
      }} />
      <XAxis categories={data[1]} />
      <YAxis title={{text: "USD / mt"}} />
    </Chart>
  );
};

export default SingleLine;
