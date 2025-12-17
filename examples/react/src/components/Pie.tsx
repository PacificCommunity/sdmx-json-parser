import { useEffect, useState } from "react";
import { Chart, Series, Subtitle, Title } from "@highcharts/react";
import { SDMXParser } from "sdmx-json-parser";
import { getHighChartsData } from "../highcharts";

const Pie = () => {
  const [data, setData] = useState<any[]>([]);
  useEffect(() => {
    const sdmx = new SDMXParser();
    (async () => {
      await sdmx.getDatasets(
        "https://stats-nsi-stable.pacificdata.org/rest/data/SPC,DF_HHEXP,1.0/A.CK.HHEXPPROP._T._T.10+11+12+01+02+03+04+05+06+07+08+09.USD?startPeriod=2013&endPeriod=2015&lastNObservations=1&dimensionAtObservation=AllDimensions&format=jsondata"
      );
      const data = sdmx.getData();
      const datas = await getHighChartsData(
        data,
        "pie",
        "",
        "value",
        "COMMODITY"
      );
      // const seriesData = [{ data: datas }];
      setData(datas);
    })();
  }, []);
  return (
    <>
      <Chart>
          <Title align="left">U.S Solar Employment Growth by Job Category, 2010-2020</Title>
          <Subtitle align="left">
            <>
              Source: <a href="https://irecusa.org./programs/solar-jobs-census/" target="_blank">IREC</a>
            </>
          </Subtitle>
          <Series type="pie" data={ data } />
      </Chart>
    </>
  );
};

export default Pie;
