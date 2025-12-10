import { useEffect, useState } from "react";
import { Chart, Series, Subtitle, Title, XAxis, YAxis } from "@highcharts/react";
import { SDMXParser } from "sdmx-json-parser"
import { getHighChartsData } from "../highcharts";

const Column = () => {
  const [data, setData] = useState<any>([]);
  useEffect(() => {
    const sdmx = new SDMXParser();
    (async () => {
      await sdmx.getDatasets(
        "https://stats-nsi-stable.pacificdata.org/rest/data/SPC,DF_WASTE,1.0/..SOLIDWASTEPC.?dimensionAtObservation=AllDimensions&format=jsondata"
      );
      const data = sdmx.getData();
      const [, xAxis] = await getHighChartsData(
        data,
        "column",
        "GEO_PICT",
        "value"
      );

      const check = data.map((val: any) => {
        const name = val.GEO_PICT;
        const y = val.value;

        return { name, y };
      });
      setData([check, xAxis]);
    })();
  }, []);
  return (
    <Chart options={{
      legend: {
        enabled: false
      }
    }}>
      <Title>Municipal Solid Waste</Title>
      <Subtitle>
        <>
          Source: <a href="https://irecusa.org./programs/solar-jobs-census/" target="_blank">PDH.stat</a>
        </>
      </Subtitle>
      <XAxis categories={data[1]} />
      <YAxis title={{text: "TON"}} />
      <Series type="column" data={data[0]} />
    </Chart>
  );
};

export default Column;
