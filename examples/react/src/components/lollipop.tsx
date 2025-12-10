import { useEffect, useState } from "react";
import { SDMXParser } from "sdmx-json-parser";
import { getHighChartsData } from "../highcharts";
import { Chart, Series, Subtitle, Title, setHighcharts } from "@highcharts/react";

import Highcharts from "highcharts/highcharts.src";
import 'highcharts/highcharts-more';
import 'highcharts/modules/dumbbell';
import 'highcharts/modules/lollipop';

setHighcharts(Highcharts);

const Lollipop = () => {
  const [data, setData] = useState<any>([]);

  useEffect(() => {
    const sdmx = new SDMXParser();
    (async () => {
      await sdmx.getDatasets(
        "https://stats-nsi-stable.pacificdata.org/rest/data/SPC,DF_NMDI_FIS,1.0/..SPC_14_b_1......?startPeriod=2013&endPeriod=2022&dimensionAtObservation=AllDimensions&format=jsondata"
      );
      const data = sdmx.getData();
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

  return (
    <Chart>
      <Title>Example Text</Title>
      <Subtitle>
        <>
          Source: <a href="https://irecusa.org./programs/solar-jobs-census/" target="_blank">PDH.stat</a>
        </>
      </Subtitle>
      <Series type="lollipop" options={{ name: data?.[0]?.["name"] }} data={data?.[0]?.["data"]} />
    </Chart>
  );
};

export default Lollipop;
