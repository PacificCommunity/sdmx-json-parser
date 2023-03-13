Documentation on how we can use SDMXParser in vanilla js

Usage

SDMX-JSON-parser provides a set of utility function to parse a SDMX-JSON message and extract data arrays.

```javascript
import { SDMXParser } from "../../index.js";
/*
once you import the parser create a object.
*/

const parser = new SDMXParser();
/*
after creating a object provide api to getDataset function
*/

await parser.getDatasets(api);
/*
once data set is loaded we can use getData function for getting parser data.
*/

const data = parser.getData();
/*
[
    {
        "GEO_PICT": "Tonga",
        "value": 17.8,
        "VIOLENCE_TYPE": "Emotional violence",
        "TIME_PERIOD": "2019"
    },
    {
        "GEO_PICT": "Fiji",
        "value": 58.3,
        "VIOLENCE_TYPE": "Emotional violence",
        "TIME_PERIOD": "2011"
    },
    {
        "GEO_PICT": "Kiribati",
        "value": 23.7,
        "VIOLENCE_TYPE": "Sexual violence",
        "TIME_PERIOD": "2019"
    },
    {
        "GEO_PICT": "Tuvalu",
        "value": 10,
        "VIOLENCE_TYPE": "Sexual violence",
        "TIME_PERIOD": "2007"
    },
    {
        "GEO_PICT": "Tonga",
        "value": 19.1,
        "VIOLENCE_TYPE": "Physical violence",
        "TIME_PERIOD": "2019"
    },
    {
        "GEO_PICT": "Cook Islands",
        "value": 13.1,
        "VIOLENCE_TYPE": "Sexual violence",
        "TIME_PERIOD": "2013"
    },
    {
        "GEO_PICT": "Solomon Islands",
        "value": 45.5,
        "VIOLENCE_TYPE": "Physical violence",
        "TIME_PERIOD": "2009"
    },
    {
        "GEO_PICT": "Kiribati",
        "value": 54,
        "VIOLENCE_TYPE": "Physical and/or sexual violence",
        "TIME_PERIOD": "2019"
    },
    {
        "GEO_PICT": "Micronesia (Federated States of)",
        "value": 18.1,
        "VIOLENCE_TYPE": "Sexual violence",
        "TIME_PERIOD": "2014"
    },
    {
        "GEO_PICT": "Tuvalu",
        "value": 36.8,
        "VIOLENCE_TYPE": "Physical and/or sexual violence",
        "TIME_PERIOD": "2007"
    }
]
*/
/*
we have other functions for name, dimensions, attributes, observations and so on...
*/
```
