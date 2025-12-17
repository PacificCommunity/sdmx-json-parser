import { useEffect, useState } from "react";
import { SDMXParser } from "sdmx-json-parser";
import { getHighChartsData } from "../highcharts";
import { Chart, Legend, Series, Subtitle, Title, XAxis, YAxis } from "@highcharts/react";

const MultiColumn = () => {
  const [series, setSeries] = useState<any>([])
  const [xAxis, setXAxis] = useState<any>([])
  useEffect(() => {
    const sdmx = new SDMXParser();
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
      setSeries(seriesData)
      setXAxis(xAxis)
    })();
  }, []);

  return (
    <Chart>
      <Title>Violence against women</Title>
      <Subtitle>
        <>
          Source: <a href="https://irecusa.org./programs/solar-jobs-census/" target="_blank">PDH.stat</a>
        </>
      </Subtitle>
      <Legend layout="vertical" align="right" verticalAlign="middle" />
      <XAxis categories={xAxis} />
      <YAxis title={{ text: "Number of persons in relative frequency" }} />
      {series.map((serieData: { name: string, data: [] }) => <Series type="column" options={{
        name: serieData.name
      }} data={serieData.data} />)}
    </Chart>
  );
};

export default MultiColumn;
