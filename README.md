# SDMX-JSON parser

A JavaScript library to parse [SDMX-JSON](https://github.com/sdmx-twg/sdmx-json) messages.

## Installation

```bash
npm install sdmx-json-parser
```

## Usage

SDMX-JSON-parser provides a set of utility function to parse a SDMX-JSON message and extract data arrays.

The method `getDataset` must be called prior to using any other method. It takes a SDMX REST URL as first parameter and an optional `fetchOptions` object as second parameter ([doc](https://developer.mozilla.org/en-US/docs/Web/API/fetch#options)). This fetch options can be used for instance to pass custom headers to the request like `Accept-language` to select the response language.

Every SDMX concepts (observation, dimensions, attributes) are given at observation level in the different methods (getData, getAttributes, getDimensions).
When observations are organized in `series` within a `dataSet`, the parser expand them as an array of `observations` concatenating the keys.


```javascript
import { SDMXParser } from sdmx-json-parser;

const sdmxDataUrl = "https://stats-nsi-stable.pacificdata.org/rest/data/SPC,DF_IMTS,4.0/M..AMT.TB+X+M.IV+I+II+III._T._T.USD?startPeriod=2015-01&dimensionAtObservation=AllDimensions";

const parser = new SDMXParser();
await parser.getDataset(sdmxDataUrl);
const name = parser.getName();
const description = parser.getDescription();
const dimensions = parser.getActiveDimensions();
const activeDimensions = parser.getDimensions();
const annotations = parser.getAnnotations();
const observations = parser.getObservations();

data = sdmx.getData(); // returns a simplified array of observations with dimension and attributes values
const slicedData = parser.getData({GEO_PICT: ['NR']}); // slice by dimension Id (GEO_PICT) values (['NR'])
```

## Example

Go to `examples/vanilla-js` folder and run a local server to see the example.

```bash
npm run server
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
