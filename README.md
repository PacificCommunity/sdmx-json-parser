# SDMX-JSON parser

A JavaScript library to parse [SDMX-JSON](https://github.com/sdmx-twg/sdmx-json) messages.

## Installation

```bash
npm install sdmx-json-parser
```

## Usage

SDMX-JSON-parser provides a set of utility function to parse a SDMX-JSON message and extract data arrays.


```javascript
import { SDMXParser } from sdmx-json-parser;

const sdmxDataUrl = "https://stats-nsi-stable.pacificdata.org/rest/data/SPC,DF_IMTS,4.0/M..AMT.TB+X+M.IV+I+II+III._T._T.USD?startPeriod=2015-01&dimensionAtObservation=AllDimensions";

const parser = new SDMXParser();
await parser.getDataset(sdmxDataUrl);
name = parser.getName();
description = parser.getDescription();
allDimensions = sdmxDataset.getRawDimensions();
dimensions = sdmxDataset.getDimensions();
annotations = sdmxDataset.getAnnotations();
observations = sdmxDataset.getObservations();
slice = sdmx.slice({GEO_PICT: ['NR']}); // slice by dimension Id (GEO_PICT) values (['NR'])


data = sdmx.getData(); // returns a simplified array of observations with dimension values
```

## Developer

### Install dependencies
```bash
npm install
```
### Build with webpack
```bash
npm run build
```
### Generate documentation
```bash
npm run generate-doc
```
