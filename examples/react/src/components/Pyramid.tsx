import { useEffect, useState } from "react";
import { SDMXParser } from "sdmx-json-parser";
import { getHighChartsData } from "../highcharts";
import { Chart, PlotOptions, Series, Subtitle, Title, XAxis, YAxis } from "@highcharts/react";

const Pyramid = () => {
  const [series, setSeries] = useState<any>([])
  const [xAxis, setXAxis] = useState<any>([])
  useEffect(() => {
    const sdmx = new SDMXParser();
    (async () => {
      await sdmx.getDatasets(
        "https://stats-nsi-stable.pacificdata.org/rest/data/SPC,DF_POP_PROJ,3.0/A.CK.MIDYEARPOPEST.F+M.Y70T999+Y65T69+Y60T64+Y55T59+Y50T54+Y45T49+Y40T44+Y35T39+Y30T34+Y25T29+Y20T24+Y15T19+Y10T14+Y05T09+Y00T04?startPeriod=2015&endPeriod=2050&dimensionAtObservation=AllDimensions&format=jsondata"
      );
      const data = sdmx.getData();
      const [seriesData, xAxis] = await getHighChartsData(
        data,
        "pyramid",
        "AGE",
        "value",
        "SEX"
      );
      if (Array.isArray(seriesData) && seriesData[0] && seriesData[0].data) {
        seriesData[0].data = seriesData[0].data.map((item: number) => {
          return -Math.abs(item);
        });
        setSeries(seriesData)
        setXAxis(xAxis)
      }
    })();
  }, []);

  return (
    <Chart>
      <Title>Cook Islands</Title>
      <Subtitle>
        <>
          Source: <a href="https://irecusa.org./programs/solar-jobs-census/" target="_blank">PDH.stat</a>
        </>
      </Subtitle>
      <XAxis categories={xAxis} reversed={false} labels={{step: 1}} />
      <XAxis categories={xAxis} reversed={false} labels={{step: 1}} linkedTo={0} opposite={true} />
      <YAxis labels={{
        formatter: (self) => { return `${Math.abs(self.value as number)}` }
      }} />
      <PlotOptions series={{stacking: "normal"}} />
      {series.map((serieData: { name: string, data: [] }) => <Series type="bar" options={{ name: serieData.name }} data={serieData.data} />)}
    </Chart>
  );
};

export default Pyramid;
