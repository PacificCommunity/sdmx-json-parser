export async function getMultiLineChart(data: any[], xAxis: string, yAxis = "value", legend: string = "") {
  const seriesData = data.reduce((acc: any[], cur) => {
    const existingRecord = acc.find((item) => {
      return item.name === cur[legend];
    });
    if (existingRecord) {
      existingRecord.data.push(cur[yAxis]);
    } else {
      acc.push({
        name: cur[legend],
        data: [cur[yAxis]],
      });
    }
    return acc;
  }, []);

  const xAxisValue = [
    ...new Set(
      data.reduce((acc: any[], cur) => {
        const existingRecord = acc.find((item) => item.name === cur[xAxis]);
        if (existingRecord) {
          existingRecord.push(cur[xAxis]);
        } else {
          acc.push(cur[xAxis]);
        }
        return acc;
      }, [])
    ),
  ];

  return [seriesData, xAxisValue];
}

export async function getLineChart(data: any[], xAxis: string, yAxis = "value") {
  const yAxisValue = data.map((val) => {
    return val[yAxis];
  });
  const xAxisValue = data.map((val) => val[xAxis]);

  return [yAxisValue, xAxisValue];
}

export async function getColumnChart(data: any[], xAxis: string, yAxis = "value") {
  const yAxisValue = data.map((val) => val[yAxis]);
  const xAxisValue = data.map((val) => val[xAxis]);
  return [yAxisValue, xAxisValue];
}

export async function getMultiColumnChart(
  data: any[],
  xAxis: string,
  yAxis = "value",
  legend: string = ""
) {
  const arr = data.reduce((acc: any[], cur) => {
    const existingRecord = acc.find((item) => item.name === cur[xAxis]);
    if (existingRecord) {
      existingRecord.push(cur[xAxis]);
    } else {
      acc.push(cur[xAxis]);
    }
    return acc;
  }, []);
  const xAxisValue = [...new Set(arr)];

  let seriesData: any[] = [];

  xAxisValue.map((m,) => {
    seriesData = data.reduce((acc: any[], cur,) => {
      const existingRecord = acc.find((item) => item.name === cur[legend]);
      if (m === cur[xAxis]) {
        if (existingRecord) {
          existingRecord.data.push(cur[yAxis]);
        } else {
          acc.push({
            name: cur[legend],
            data: [cur[yAxis]],
          });
        }
      }

      return acc;
    }, seriesData || []);
  });

  return [seriesData, xAxisValue];
}

export async function getPieChart(data: any[], yAxis = "value", legend: string = "") {
  const seriesData = data.map((val) => {
    return { name: val[legend], y: val[yAxis] };
  });
  return seriesData;
}

export async function getPyramidChart(
  data: any[],
  xAxis: string,
  yAxis: string,
  legend: string = "",
  year = "2016"
) {
  const seriesData: any[] = [];
  data.map((val,) => {
    if (val.TIME_PERIOD === year) {
      const existingRecord = seriesData.find((item: any) => {
        return item.name === val[legend];
      });
      if (existingRecord) {
        existingRecord.data.push(val[yAxis]);
      } else {
        seriesData.push({
          name: val[legend],
          data: [val[yAxis]],
        });
      }
      return seriesData;
    }
  });

  const xAxisValue = [
    ...new Set(
      data.reduce((acc: any[], cur) => {
        const existingRecord = acc.find((item) => item.name === cur[xAxis]);
        if (existingRecord) {
          existingRecord.push(cur[xAxis]);
        } else {
          acc.push(cur[xAxis]);
        }
        return acc;
      }, [])
    ),
  ];

  return [seriesData, xAxisValue];
}

export async function getLollipopChart(data: any[], xAxis: string, yAxis = "value", legend: string = "") {
  const datas = data.reduce((acc: any[], cur) => {
    acc.find((item: any) => {
      return item.name === cur[xAxis];
    });
    acc.push({
      name: cur[xAxis],
      y: !cur[yAxis] ? 0 : cur[yAxis],
    });
    return acc;
  }, []);
  const seriesData = [{ name: legend, data: datas }];
  return seriesData;
}

export async function getHighChartsData(
  data = [],
  chartType = "line",
  xAxis: string,
  yAxis: string,
  legend?: string
) {
  if (!data.length) {
    throw new Error("No Data Found Please Provide The Data");
  }
  switch (chartType) {
    case "line":
      return await getLineChart(data, xAxis, yAxis);

    case "multiLine":
      return await getMultiLineChart(data, xAxis, yAxis, legend);

    case "column":
      return await getColumnChart(data, xAxis, yAxis);

    case "multiColumn":
      return await getMultiColumnChart(data, xAxis, yAxis, legend);

    case "pie":
      return await getPieChart(data, yAxis, legend);

    case "pyramid":
      return await getPyramidChart(data, xAxis, yAxis, legend);

    case "lollipop":
      return await getLollipopChart(data, xAxis, yAxis, legend);
    default:
      throw new Error("Chart Type Not Supported");
  }
}
