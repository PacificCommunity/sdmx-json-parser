import { useEffect, useState } from "react";
import {Chart, Legend, Series, Subtitle, Title, XAxis} from "@highcharts/react";
import { SDMXParser } from "sdmx-json-parser";
import { getHighChartsData } from "../highcharts";
const MultiLine = () => {
  const [series, setSeries] = useState<any>([])
  const [xAxis, setXAxis] = useState<any>([])
  useEffect(() => {
    const sdmx = new SDMXParser();
    (async () => {
      await sdmx.getDatasets(
        "https://stats-nsi-stable.pacificdata.org/rest/data/SPC,DF_CROPS,1.0/A..5510.136?dimensionAtObservation=AllDimensions&format=jsondata"
      );
      const sdmxData = sdmx.getData();
      const [seriesData, xAxis] = await getHighChartsData(
        sdmxData,
        "multiLine",
        "TIME_PERIOD",
        "value",
        "GEO_PICT"
      );
      setSeries(seriesData);
      setXAxis(xAxis);
    })();
  }, []);

  return (
    <Chart>
      <Title>Taro Production (Tonnes)</Title>
      <Subtitle>
        <>
          Source: <a href="https://irecusa.org./programs/solar-jobs-census/" target="_blank">PDH.stat (FAOSTAT)</a>
        </>
      </Subtitle>
      { series.map((dataSerie: {name: string, data: []}) => <Series type="line" options={{
        name: dataSerie.name
      }} data={dataSerie.data} /> )}
      <XAxis categories={xAxis} />
      <Legend layout="vertical" align="right" verticalAlign="middle" />
    </Chart>
  );
};

export default MultiLine;
