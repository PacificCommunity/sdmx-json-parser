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

### Response shapes

`getDatasets` accepts the SDMX-JSON dialects seen across public providers and normalises them to one internal shape: SDMX-JSON 2.0 (`data.structures[]`), the .Stat 1.0 envelope (`data.structure`, singular), and the 1.0 root dialect used by the ECB (`structure` and `dataSets` at the document root, with no `data` envelope and no `keyPosition` on dimensions, which the parser synthesises from dimension order).

### Request negotiation

No single request serves SDMX-JSON from every provider, so `getDatasets` tries up to three mechanisms in order, stopping at the first that returns HTTP 200 with a JSON content type:

1. `format=jsondata` with `Accept: application/vnd.sdmx.data+json;version=1.0.0` — most providers, plus UNICEF and BIS;
2. bare `format=jsondata` with no SDMX `Accept` header — the ECB (which 406s any SDMX-JSON media type);
3. `Accept: application/json` — the IMF (which serves SDMX-JSON only for the generic media type and returns XML with HTTP 200 to the other two, hence the JSON-content-type check rather than a status check).

Supplying your own `Accept` header in the fetch options opts out and sends a single request. Note: Eurostat (ESTAT) does not serve SDMX-JSON at all — its JSON endpoint returns JSON-stat, a different format this parser does not read.

### Custom transport

The fetch options accept a non-standard `fetcher` key: a function with the `fetch` signature `(url, init) => Promise<Response>`. When provided, every request goes through it, so a consumer can add authentication, proxying, caching, or retries; the global `fetch` is used when it is absent.


```javascript
import { SDMXParser } from sdmx-json-parser;

const sdmxDataUrl = "https://stats-nsi-stable.pacificdata.org/rest/data/SPC,DF_IMTS,4.0/M..AMT.TB+X+M.IV+I+II+III._T._T.USD?startPeriod=2015-01&dimensionAtObservation=AllDimensions";

const parser = new SDMXParser();
await parser.getDataset(sdmxDataUrl);
const name = parser.getName();
const description = parser.getDescription();
const dimensions = parser.getDimensions();
const activeDimensions = parser.getActiveDimensions();
const annotations = parser.getAnnotations();
const observations = parser.getObservations();

data = sdmx.getData(); // returns a simplified array of observations with dimension and attributes values
const slicedData = parser.getData({GEO_PICT: ['NR']}); // slice by dimension Id (GEO_PICT) values (['NR'])
```

## Example

Go to `examples` folder and run a local server to see the example.

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
