# SDMX-JSON parser

A JavaScript library to parse [SDMX-JSON](https://github.com/sdmx-twg/sdmx-json) messages.


## Documentation

SDMX-JSON-parser provides a set of utility function to parse a SDMX-JSON message and extract data arrays.


```javascript
import { SDMXParser } from SDMXParser
const sdmxDataUrl = "https://stats-nsi-stable.pacificdata.org/rest/data/SPC,DF_VAW,1.0/A..VAW_TOPIC_001......PARTNER.ALOLIFE.....?lastNObservations=1&dimensionAtObservation=AllDimensions";
sdmxDataset = SDMXParser.getDataset(sdmxDataUrl, {
    headers: {
        'Accept': 'application/vnd.sdmx.data+json;version=2.0.0'
    }
}, 0);
/**
 * getDataset
 * @param {string} SdmxDataUrl
 * @param {Object} [RequestOptions] Optional request options as in fetch()
 * @param {number} [DatasetIndex] // in a single sdmxDataUrl, multiple datasets and structures can be described. Default value 0.

```

Multiple datasets can be describe with a single URL. By default, we will consider the first dataSet (and the associated structure).

**dataSet information**

```javascript
name = sdmxDataset.getName();
description = sdmxDataset.getDescription();
console.log(name);
console.log(description);

/*
output for sdmxDataUrl provided as example:
Violence against women
This table regroups a series of indicators related to violence against women collected from various sources (national surveys, international databases).
*/
```

**dataSet's dimensions**

```javascript
dimensions = sdmxDataset.getRawDimensions();
console.log(dimensions);
/*
result is basically a dump of the "dimensions" section in SDMX-JSON:
[
    {
        "id": "FREQ",
        "name": "Frequency",
        "names": {
            "en": "Frequency"
        },
        "keyPosition": 0,
        "roles": [
            "FREQ"
        ],
        "values": [
            {
                "id": "A",
                "order": 1,
                "name": "Annual",
                "names": {
                    "en": "Annual"
                },
                "annotations": [
                    9
                ]
            }
        ]
    },
    {
        "id": "GEO_PICT",
        "name": "Pacific Island Countries and territories",
        "names": {
            "en": "Pacific Island Countries and territories"
        },
        "keyPosition": 1,
        "roles": [
            "GEO_PICT"
        ],
        "values": [
            {
                "id": "CK",
                "order": 5,
                "name": "Cook Islands",
                "names": {
                    "en": "Cook Islands"
                },
                "parent": "POL",
                "annotations": [
                    10
                ]
            },
            {
                "id": "FJ",
                "order": 6,
                "name": "Fiji",
                "names": {
                    "en": "Fiji"
                },
                "parent": "MEL",
                "annotations": [
                    11
                ]
            },
            ...
            {
                "id": "WS",
                "order": 25,
                "name": "Samoa",
                "names": {
                    "en": "Samoa"
                },
                "parent": "POL",
                "annotations": [
                    22
                ]
            }
        ]
    },
    ...
    {
        "id": "TIME_PERIOD",
        "name": "Time",
        "names": {
            "en": "Time"
        },
        "keyPosition": 15,
        "roles": [
            "TIME_PERIOD"
        ],
        "values": [
            {
                "start": "2013-01-01T00:00:00",
                "end": "2013-12-31T23:59:59",
                "id": "2013",
                "name": "2013",
                "names": {
                    "en": "2013"
                }
            },
            ...
            {
                "start": "2006-01-01T00:00:00",
                "end": "2006-12-31T23:59:59",
                "id": "2006",
                "name": "2006",
                "names": {
                    "en": "2006"
                }
            }
        ]
    }
]
*/

```
**dataSet annotations**

```javascript

annotations = sdmxDataset.getAnnotations();
console.log(annotations)

/*
result will be the dump of annotations of the dataset
   [
    {
        "type": "NonProductionDataflow",
        "text": "true",
        "texts": {
            "en": "true"
        }
    },
    {
        "title": "INDICATOR",
        "type": "ROW_SECTION"
    },
    {
        "title": "GEO_PICT",
        "type": "LAYOUT_COLUMN"
    },
    {
        "title": "CROP",
        "type": "LAYOUT_ROW"
    },
    {
        "title": "FREQ=A,INDICATOR=PROD,TIME_PERIOD_START=2020,TIME_PERIOD_END=2020",
        "type": "DEFAULT"
    },
    {
        "title": "PDH.STAT,ENVIRONMENT,FAO,CROP",
        "type": "TAGS"
    },
    {
        "title": "500",
        "type": "MAXTEXTATTRIBUTELENGTH"
    },
    {
        "title": "urn:sdmx:org.sdmx.infomodel.metadatastructure.MetadataStructure=SPC:MSD_COM_GENERAL(1.0)",
        "type": "METADATA"
    },
    {
        "type": "HAS_METADATA"
    },
    {
        "type": "ORDER",
        "text": "20",
        "texts": {
            "en": "20"
        }
    },
    {
        "type": "ORDER",
        "text": "110",
        "texts": {
            "en": "110"
        }
    }   
]
*/

```
**dataSet annotations**

```javascript

observations = sdmxDataset.getObservations();
console.log(observations)

/*
result will be the dump of observations of the dataset
   {
   "0:0:0:1":[
    700,
    0,
    null,
    null,
    null,
    null
],
"0:0:0:2":[
    700,
    0,
    null,
    null,
    null,
    null
],
"0:0:0:3":[
    1140,
    0,
    null,
    null,
    null,
    null
],
"0:0:0:4":[
    1750,
    0,
    null,
    null,
    null,
    null
],
}
*/



```
**dataSet annotations**

```javascript

attributes = sdmxDataset.getAttributes();
console.log(attributes)

/*
result will be the dump of attributes of the dataset
  [
    {
        "type": "NonProductionDataflow",
        "text": "true",
        "texts": {
            "en": "true"
        }
    },
    {
        "title": "INDICATOR",
        "type": "ROW_SECTION"
    },
    {
        "title": "GEO_PICT",
        "type": "LAYOUT_COLUMN"
    },
    {
        "title": "CROP",
        "type": "LAYOUT_ROW"
    },
    {
        "title": "FREQ=A,INDICATOR=PROD,TIME_PERIOD_START=2020,TIME_PERIOD_END=2020",
        "type": "DEFAULT"
    },
    {
        "title": "PDH.STAT,ENVIRONMENT,FAO,CROP",
        "type": "TAGS"
    },
    {
        "title": "500",
        "type": "MAXTEXTATTRIBUTELENGTH"
    },
    {
        "title": "urn:sdmx:org.sdmx.infomodel.metadatastructure.MetadataStructure=SPC:MSD_COM_GENERAL(1.0)",
        "type": "METADATA"
    },
    {
        "type": "HAS_METADATA"
    },
    {
        "type": "ORDER",
        "text": "20",
        "texts": {
            "en": "20"
        }
    }
*/

```
**dataSet dimensions**

```javascript
dimensions = sdmxDataset.getDimensions();
console.log(dimensions);

/*
result is basically a collection of  only in use "dimensions" section in SDMX-JSON:
[
    {
        "id": "FREQ",
        "name": "Frequency",
        "names": {
            "en": "Frequency"
        },
        "keyPosition": 0,
        "roles": [
            "FREQ"
        ],
        "values": [
            {
                "id": "A",
                "order": 1,
                "name": "Annual",
                "names": {
                    "en": "Annual"
                },
                "annotations": [
                    9
                ]
            }
        ]
    },
    {
        "id": "GEO_PICT",
        "name": "Pacific Island Countries and territories",
        "names": {
            "en": "Pacific Island Countries and territories"
        },
        "keyPosition": 1,
        "roles": [
            "GEO_PICT"
        ],
        "values": [
            {
                "id": "CK",
                "order": 5,
                "name": "Cook Islands",
                "names": {
                    "en": "Cook Islands"
                },
                "parent": "POL",
                "annotations": [
                    10
                ]
            },
            {
                "id": "FJ",
                "order": 6,
                "name": "Fiji",
                "names": {
                    "en": "Fiji"
                },
                "parent": "MEL",
                "annotations": [
                    11
                ]
            },
            ...
            {
                "id": "WS",
                "order": 25,
                "name": "Samoa",
                "names": {
                    "en": "Samoa"
                },
                "parent": "POL",
                "annotations": [
                    22
                ]
            }
        ]
    },
    ...
    {
        "id": "TIME_PERIOD",
        "name": "Time",
        "names": {
            "en": "Time"
        },
        "keyPosition": 15,
        "roles": [
            "TIME_PERIOD"
        ],
        "values": [
            {
                "start": "2013-01-01T00:00:00",
                "end": "2013-12-31T23:59:59",
                "id": "2013",
                "name": "2013",
                "names": {
                    "en": "2013"
                }
            },
            ...
            {
                "start": "2006-01-01T00:00:00",
                "end": "2006-12-31T23:59:59",
                "id": "2006",
                "name": "2006",
                "names": {
                    "en": "2006"
                }
            }
        ]
    }
]
*/

geo_pict_dimension = sdmxDataset.getDimension('FREQ');
/*
[
    {
        "id": "FREQ",
        "name": "Frequency",
        "names": {
            "en": "Frequency"
        },
        "keyPosition": 0,
        "roles": [
            "FREQ"
        ],
        "values": [
            {
                "id": "A",
                "order": 1,
                "name": "Annual",
                "names": {
                    "en": "Annual"
                },
                "annotations": [
                    9
                ]
            }
        ]
    }
]
*/




```

**dataSet data**

The library defines an Object called SDMXObservation. `getData` and `slice` returns an array of SDMXObservations.

```javascript

data = sdmx.getData();
/*
[
    {
        'dimensions': {
            'sdmxKey': '0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0',
            'FREQ': {
                'id': "A",
                'name': "Annual"
            },
            'GEO_PICT': {
                'id': "CK",
                'name': "Cook Islands"
            },
            ...
            'TIME_PERIOD': {
                'id': "2013",
                'name': "2013"
            }
        },
        'measure': 26.7,
        'attributes': [{
            'UNIT_MEASURE': {
                'id': 'PERCENT',
                'name': 'percent'
            },
            'UNIT_MULT': null,
            'OBS_STATUS': null,
            'DATA_SOURCE': null,
            'OBS_COMMENT': null
        }]
    },
    ...
    {
        'dimensions': {
            'sdmxKey': '0:12:0:0:0:0:0:3:0:0:0:0:0:0:0:9'
            'FREQ': {
                'id': "A",
                'name': "Annual"
            },
            'GEO_PICT': {
                'id': 'WS',
                'name': 'Samoa'
            },
            ...
            'TIME_PERIOD': {
                'id': "2006",
                'name': "2006"
            }
        },
        'measure': 46,
        'attributes': [{
            'UNIT_MEASURE': {
                'id': 'PERCENT',
                'name': 'percent'
            },
            'UNIT_MULT': null;
            'OBS_STATUS': null,
            'DATA_SOURCE': null,
            'OBS_COMMENT': {
                'id': "Women 15-49. ",
                'name': "Women 15-49. "
            }
        }]
    }
]
*/

slice = sdmx.slice({'GEO_PICT': ['NR']}); // slice by GEO_PICT dimension with value Nauru
console.log(slice);
/*
[
    {
        'dimensions': {
            'sdmxKey': '0:5:0:0:0:0:0:0:0:0:0:0:0:0:0:0',
            'FREQ': {
                'id': "A",
                'name': "Annual"
            },
            'GEO_PICT': {
                'id': "NR",
                'name': "Nauru"
            },
            ...,
            'VIOLENCE_TYPE': {
                'id': "EMO",
                'name': "Emotional violence"
            },
            ...,
            'TIME_PERIOD': {
                'id': "2013",
                'name': "2013"
            }
        },
        'measure': null,
        'attributes': [{
            'UNIT_MEASURE': {
                'id': 'PERCENT',
                'name': 'percent'
            },
            'UNIT_MULT': null,
            'OBS_STATUS': {
                'id': "O";
                'name': "Missing value"
            },
            'DATA_SOURCE': null,
            'OBS_COMMENT': null
        }]
    },
    {
        'dimensions': {
            'sdmxKey': '0:5:0:0:0:0:0:1:0:0:0:0:0:0:0:0',
            'FREQ': {
                'id': "A",
                'name': "Annual"
            },
            'GEO_PICT': {
                'id': "NR",
                'name': "Nauru"
            },
            ...,
            'VIOLENCE_TYPE': {
                'id': "SEX",
                'name': "Sexual violence"
            },
            ...,
            'TIME_PERIOD': {
                'id': "2013",
                'name': "2013"
            }
        },
        'measure': 20.6,
        'attributes': [{
            'UNIT_MEASURE': {
                'id': 'PERCENT',
                'name': 'percent'
            },
            'UNIT_MULT': null,
            'OBS_STATUS': null,
            'DATA_SOURCE': null,
            'OBS_COMMENT': null
        }]
    },
    {
        'dimensions': {
            'sdmxKey': '0:5:0:0:0:0:0:2:0:0:0:0:0:0:0:0',
            'FREQ': {
                'id': "A",
                'name': "Annual"
            },
            'GEO_PICT': {
                'id': "NR",
                'name': "Nauru"
            },
            ...,
            'VIOLENCE_TYPE': {
                'id': "PHYS",
                'name': "Physical violence"
            },
            ...,
            'TIME_PERIOD': {
                'id': "2013",
                'name': "2013"
            }
        },
        'measure': 46.6,
        'attributes': [{
            'UNIT_MEASURE': {
                'id': 'PERCENT',
                'name': 'percent'
            },
            'UNIT_MULT': null,
            'OBS_STATUS': null,
            'DATA_SOURCE': null,
            'OBS_COMMENT': null
        }]
    },
    {
        'dimensions': {
            'sdmxKey': '0:5:0:0:0:0:0:3:0:0:0:0:0:0:0:0',
            'FREQ': {
                'id': "A",
                'name': "Annual"
            },
            'GEO_PICT': {
                'id': "NR",
                'name': "Nauru"
            },
            ...,
            'VIOLENCE_TYPE': {
                'id': "PHYSORSEX",
                'name': "Physical and/or sexual violence"
            },
            ...,
            'TIME_PERIOD': {
                'id': "2013",
                'name': "2013"
            }
        },
        'measure': 48.1,
        'attributes': [{
            'UNIT_MEASURE': {
                'id': 'PERCENT',
                'name': 'percent'
            },
            'UNIT_MULT': null,
            'OBS_STATUS': null,
            'DATA_SOURCE': null,
            'OBS_COMMENT': null
        }]
    },
]

*/
```
