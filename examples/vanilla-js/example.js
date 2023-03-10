import { SDMXParser } from "../../index.js";
import { getHighChartsData } from "../react/src/highcharts.js";
const resp = new SDMXParser();
async function singleLineChart(data, type, xAxis, yAxis) {
  await resp.getDatasets(data);
  const res = resp.getData();
  return await getHighChartsData(res, type, xAxis, yAxis);
}
async function multiLineChart(data, type, xAxis, yAxis, legend) {
  await resp.getDatasets(data);
  const res = resp.getData();
  return await getHighChartsData(res, type, xAxis, yAxis, legend);
}

async function columnChart(data, type, xAxis, yAxis) {
  await resp.getDatasets(data);
  const res = resp.getData();
  return await getHighChartsData(res, type, xAxis, yAxis);
}

async function multiColumnChart(data, type, xAxis, yAxis, legend) {
  await resp.getDatasets(data);
  const res = resp.getData();
  return await getHighChartsData(res, type, xAxis, yAxis, legend);
}
async function pieChart(data, type, xAxis, yAxis, legend) {
  await resp.getDatasets(data);
  const res = resp.getData();
  return await getHighChartsData(res, type, xAxis, yAxis, legend);
}

async function lollipopChart(data, type, xAxis, yAxis, legend) {
  await resp.getDatasets(data);
  const res = resp.getData();
  return await getHighChartsData(res, type, xAxis, yAxis, legend);
}

async function pyramidChart(data, type, xAxis, yAxis, legend) {
  await resp.getDatasets(data);
  const res = resp.getData();
  return await getHighChartsData(res, type, xAxis, yAxis, legend);
}

async function sdmxParser(api, chartType) {
  switch (chartType) {
    case "line":
      return await singleLineChart(api, chartType, "TIME_PERIOD", "value");
    case "multiLine":
      return await multiLineChart(
        api,
        chartType,
        "TIME_PERIOD",
        "value",
        "GEO_PICT"
      );
    case "column":
      return await columnChart(api, chartType, "GEO_PICT", "value");
    case "multiColumn":
      return await multiColumnChart(
        api,
        chartType,
        "GEO_PICT",
        "value",
        "VIOLENCE_TYPE"
      );
    case "pie":
      return await pieChart(api, chartType, "", "value", "COMMODITY");
    case "lollipop":
      return await lollipopChart(
        api,
        chartType,
        "GEO_PICT",
        "value",
        "Population"
      );
    case "pyramid":
      return await pyramidChart(api, chartType, "AGE", "value", "SEX");
    default:
      return "please provide one chart type";
  }
}

(async () => {
  const response = await sdmxParser(
    "https://stats-nsi-stable.pacificdata.org/rest/data/SPC,DF_NMDI_FIS,1.0/..SPC_14_b_1......?startPeriod=2013&endPeriod=2022&dimensionAtObservation=AllDimensions&format=jsondata",
    "lollipop"
  );
})();
