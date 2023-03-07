// const SDMXParser = require("./index.js");
import {SDMXParser} from "./index.js"
import {getHighChartsData} from "./highcharts.js"

const resp = new SDMXParser();

async function singleLineChart(data,type,xAxis,yAxis){
    await resp.getDatasets(data);
    const data = await resp.getData();
    return await resp.getHighChartsData(data, type,xAxis,yAxis);
}
async function multiLineChart(data,type,xAxis,yAxis,legend){
        await resp.getDatasets(data);
        const data = await resp.getData();  
       return await getHighChartsData(data, type,xAxis,yAxis,legend);
}

async function columnChart(data,type,xAxis,yAxis){
    await resp.getDatasets(data);
    const data = await resp.getData();
    return await resp.getHighChartsData(data, type,xAxis,yAxis);
}

async function multiColumnChart(data,type,xAxis,yAxis,legend){
    await resp.getDatasets(data);
    const data = await resp.getData();
    return  await resp.getHighChartsData(data, type,xAxis,yAxis,legend);
}
async function pieChart(data,type,xAxis,yAxis,legend){
    await resp.getDatasets(data);
    const data = await resp.getData();
    return  await resp.getHighChartsData(data, type,xAxis,yAxis,legend);
}

async function lollipopChart(data,type,xAxis,yAxis,legend){
    await resp.getDatasets(data);
    const data = await resp.getData();
    return  await resp.getHighChartsData(data, type,xAxis,yAxis,legend);
}

async function pyramidChart(data,type,xAxis,yAxis,legend){
    await resp.getDatasets(data);
    const data = await resp.getData();
    return  await resp.getHighChartsData(data, type,xAxis,yAxis,legend);
}


async function sdmxParser(data,chartType){
    switch(chartType){
        case "line":
            return await singleLineChart(data,chartType,"TIME_PERIOD","value")
        case "multiLine":
            return await multiLineChart(data,chartType,"TIME_PERIOD","value","GEO_PICT")
        case "column":
            return await columnChart(data, chartType,
            "GEO_PICT",
            "value")
        case "multiColumn":
            return await multiColumnChart( data,
                chartType,
                "GEO_PICT",
                "value",
                "VIOLENCE_TYPE")
        case "pie":
            return await pieChart(data,chartType,"","value","COMMODITY")
        case "lollipop":
            return await lollipopChart(data,chartType,"GEO_PICT",
            "value",
            "Population")
        case "pyramid":
            return await pyramidChart(data,chartType,"AGE",
            "value",
            "SEX")
        default:
            return "please provide one chart type"
    }
}
