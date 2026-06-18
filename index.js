import { JSONParser } from "@streamparser/json";
/** Class containing parser data */
export class SDMXParser {
  /**
   *  Initializing the global variables using constructor
   */
  constructor() {
    this.getJSON;
    this.name;
    this.descriptions;
    this.dimensions;
    this.annotations;
    this.observations;
    this.attributes;
  }

  /**
   * This function parses the `series` section.
   * SDMX-JSON allows duplicate keys which are not supported by JSON.parse
   * series are expanded to observatoins with a key formed by the series key and the observation key
   * A JSON Stream parser is used to process the duplicated keys
   * @param {String} txt  SDMX-JSON response as a string
   * @return {Object} observations
   */
  parseSeriesInDatasets(txt) {
    let observations = {};
    try {
      // Two locations: SDMX-JSON 2.0 and the .Stat-flavoured 1.0 carry
      // dataSets inside a `data` envelope; the 1.0 root dialect (e.g. ECB)
      // carries dataSets at the document root. parseSeriesInDatasets runs on
      // the raw response text before the shape is normalised, so both paths
      // are needed. A response matches only one.
      const parser = new JSONParser({paths: ["$.data.dataSets.*.series.*", "$.dataSets.*.series.*"]});
      parser.onValue = function (jsonValue, key, parent, stack) {
        Object.keys(jsonValue.value.observations).forEach((obskey, i) => {
          observations[`${jsonValue.key}:${obskey}`] = jsonValue.value.observations[obskey];
          // if attributes are present, they are inserted in the observations right after the observation value
          if(jsonValue.value.attributes){
            observations[`${jsonValue.key}:${obskey}`].splice(1, 0, ...jsonValue.value.attributes);
          }
        })
      }

      parser.write(txt);
    } catch (err) {
      throw new Error(err);
    }
    return observations;
  }

  /**
   *
   * This function gets api url in parameter and generates the SDMX-JSON dataSet from the api
   * If the response contains series, the series are expanded to observations
   * @param {String} api URL of the SDMX api
   * @param {Object} options Request options used while fetching (optional).
   *   The non-standard `fetcher` key accepts a function with the fetch
   *   signature `(url, init) => Promise<Response>`; when present every request
   *   goes through it (so consumers can add auth, proxying, caching, retries).
   *   Remaining keys are passed to the request as its init object. A
   *   caller-supplied `Accept` header disables the built-in negotiation below.
   * @return {Array} SDMX-JSON response
   */
  async getDatasets(api, options = {}) {
    try {
      let url = api;
      // append format=jsondata with the correct separator (the original code
      // always used `&`, producing an invalid URL when there was no query)
      if (!url.endsWith(".json") && !url.includes("format=jsondata")) {
        url = `${url}${url.includes("?") ? "&" : "?"}format=jsondata`;
      }
      const { fetcher, ...init } = options;
      const doFetch = fetcher || fetch;
      const callerSetAccept = new Headers(init.headers || {}).has("Accept");
      const requestWith = (accept) => {
        const headers = new Headers(init.headers || {});
        if (accept) headers.set("Accept", accept);
        return doFetch(url, { ...init, headers });
      };
      const yieldsJson = (resp) => {
        const ct = (resp.headers && typeof resp.headers.get === "function" && resp.headers.get("content-type")) || "";
        return resp.status === 200 && ct.toLowerCase().includes("json");
      };
      // No single request serves SDMX-JSON from every provider (verified live
      // across SPC/FBOS/SBS/ECB/OECD/ILO/ABS/UNICEF/BIS/IMF):
      //  - most obey the `format=jsondata` query param and 406 the v1.0 JSON
      //    media type;
      //  - UNICEF and BIS only serve JSON for `Accept: ...;version=1.0.0`;
      //  - ECB serves JSON for bare format=jsondata but 406s ANY SDMX-JSON
      //    Accept header;
      //  - IMF serves SDMX-JSON only for a generic `Accept: application/json`,
      //    and returns XML (HTTP 200) to the other two — so the fallback must
      //    key on the response being JSON, not merely on a non-200 status.
      // Try each mechanism until one returns a 200 with a JSON content type.
      // A caller-supplied Accept opts out (single request, caller in control).
      const acceptSequence = callerSetAccept
        ? [null]
        : ["application/vnd.sdmx.data+json;version=1.0.0", null, "application/json"];
      let response;
      for (let i = 0; i < acceptSequence.length; i++) {
        response = await requestWith(acceptSequence[i]);
        if (callerSetAccept || yieldsJson(response) || i === acceptSequence.length - 1) {
          break;
        }
      }
      if (response.status !== 200) {
        throw new Error(
          "Error while fetching data please provide valid api url"
        );
      }
      const txt = await response.text();
      const seriesObservations = this.parseSeriesInDatasets(txt);
      this.getJSON = this.normalizeShape(JSON.parse(txt));
      // if series are present in the response, replace the badly-parsed series with observations extracted by parseSeries
      if (Object.keys(seriesObservations).length > 0) {
        this.getJSON.data.dataSets[0].observations = seriesObservations;
        delete this.getJSON.data.dataSets[0].series;
      }
    } catch (err) {
      throw new Error(err);
    }
    return this.getJSON;
  }

  /**
   * Reshape the two dialects the readers do not natively handle into the form
   * getStructure()/getObservations()/getData() expect. Idempotent: responses
   * already in the canonical shape pass through untouched.
   * @param {Object} json parsed SDMX-JSON response
   * @return {Object} the same object, reshaped in place
   */
  normalizeShape(json) {
    if (!json || typeof json !== "object") {
      return json;
    }
    // SDMX-JSON 1.0 root dialect (ECB): `structure` and `dataSets` sit at the
    // document root with no `data` envelope. Wrap them so the readers, which
    // look under `data`, work unchanged.
    if (!json.data && (json.structure || json.dataSets)) {
      json.data = {};
      if (json.structure) {
        json.data.structure = json.structure;
        delete json.structure;
      }
      if (json.dataSets) {
        json.data.dataSets = json.dataSets;
        delete json.dataSets;
      }
    }
    // Synthesise keyPosition when the response omits it (the ECB root dialect
    // carries none). getData()/getActiveDimensions() locate a dimension by
    // matching its keyPosition against the index in the (series-expanded)
    // observation key; without it no dimension is attached to the parsed rows.
    // Series dimensions fill the leading key positions, observation dimensions
    // follow, which matches the seriesKey:obsKey layout. Only fill gaps, so
    // responses that already carry keyPosition (2.0, .Stat) are untouched.
    const structure = json.data && (
      json.data.structure ||
      (Array.isArray(json.data.structures) && json.data.structures[0])
    );
    if (structure && structure.dimensions) {
      let keyPosition = 0;
      ["series", "observation"].forEach((group) => {
        (structure.dimensions[group] || []).forEach((dimension) => {
          if (dimension.keyPosition === undefined) {
            dimension.keyPosition = keyPosition;
          }
          keyPosition++;
        });
      });
    }
    return json;
  }

  /**
   * Get the structure from the SDMX-JSON response
   * @return {Object} Structure of the dataset
   */
  getStructure() {
    if (
      this.getJSON &&
      this.getJSON.data &&
      this.getJSON.data.structure
    ) {
      return this.getJSON.data.structure;
    } else if (
      this.getJSON &&
      this.getJSON.data &&
      this.getJSON.data.structures[0]
    ) {
      return this.getJSON.data.structures[0];
    } else {
      throw new Error("Structure not found");
    }
  }

  /**
   * Get the name or title from the SDMX-JSON response
   * @return {String} Name or Title from the dataset
   */
  getName() {
    this.name = this.getStructure().name;

    return this.name;
  }

  /**
   * Get the Description or Subtitle from the SDMX-JSON response
   * @return {String} Description or Subtitle of the dataset
   */
  getDescription() {
    this.descriptions = this.getStructure().description;

    return this.descriptions;
  }

  /**
   * Get the Attributes from the SDMX-JSON response
   * @return {Array} Attributes of the dataset
   */
  getAttributes() {
    if (this.getStructure().dimensions) {
      this.attributes = this.getStructure().attributes.observation;
      if (this.getStructure().attributes.series && this.getStructure().attributes.series.length > 0) {
        this.attributes = this.getStructure().attributes.series.concat(this.attributes)
      }
      if (this.getStructure().attributes.dataSet && this.getStructure().attributes.dataSet.length > 0) {
        this.attributes = this.getStructure().attributes.dataSet.concat(this.attributes)
      }
    } else {
      throw new Error("Attributes not found");
    }

    return this.attributes;
  }

  /**
   * Get the dimensions of the dataflow
   * If the response contains series, the series are expanded to dimensions observation
   * @return {Array} Dimensions of the dataset in SDMX-JSON response
   */
  getDimensions() {
    if (this.getStructure().dimensions) {
      this.dimensions = this.getStructure().dimensions.observation;
      if (this.getStructure().dimensions.series && this.getStructure().dimensions.series.length > 0) {
        this.dimensions = this.getStructure().dimensions.series.concat(this.dimensions)
      }
      if (this.getStructure().dimensions.dataSet && this.getStructure().dimensions.dataSet.length > 0) {
        this.dimensions = this.getStructure().dimensions.dataSet.concat(this.dimensions)
      }
    } else {
      throw new Error("Dimensions not found");
    }
    return this.dimensions;
  }


  /**
   * Get a specific dimension from the SDMX-JSON response
   * @param {string} id
   * @returns Dimension in SDMX-JSON response
   */
  getDimension(id) {
    if (id) {
      const dimensions = this.getDimensions();
      const dimension = dimensions.filter((val, _index) => {
        return val.id === id;
      });
      if (!dimension.length) {
        throw new Error(`Dimension ${id} not found`);
      }
      return dimension;
    } else {
      throw new Error("Please provide dimension id");
    }
  }

  /**
   *
   * Get all the dimensions for which we have more than one value in the observation
   * We check in the observation keys if we have an index value greater than 0
   * @return {Array} Dimensions active of the dataset in SDMX-JSON response
   */
  getActiveDimensions() {
    const [dimension, observations] = [
      this.getDimensions(),
      this.getObservations(),
    ];

    let KeyIndexs = [];
    Object.keys(observations).forEach((val, _index) => {
      let keys = val.split(":");
      keys.map((val, index) => {
        if (val > 0) {
          if (KeyIndexs.includes(index)) {
            return;
          } else {
            KeyIndexs.push(index);
          }
        }
      });
    });

    const incrementalDimensions = KeyIndexs.map((val, _index) => {
      return dimension.find((val2, _index2) => {
        return val2.keyPosition === val;
      });
    });
    return incrementalDimensions;
  }

  /**
   * Get the observations from the SDMX-JSON response
   * If the response contains series, the series are expanded to observations
   * @return {Object} Observations of the dataset in SDMX-JSON response
   */
  getObservations() {
    if (
      this.getJSON &&
      this.getJSON.data &&
      this.getJSON.data.dataSets
    ) {
      if (this.getJSON.data.dataSets[0].series) {
        this.observations = {};
        const series = this.getJSON.data.dataSets[0].series;

        let seriesKeys = Object.keys(series);
        seriesKeys.forEach((val, _index) => {
          const serie = series[val];
          const obs_keys = Object.keys(serie.observations);
          obs_keys.forEach((val2, _index2) => {
            this.observations[`${val}:${val2}`] = serie.observations[val2];
            // add series attributes to observations (at the beginning right after the observation value)
            if (serie.attributes) {
              this.observations[`${val}:${val2}`].splice(1, 0, ...serie.attributes);
            }
          });
        });
      } else if (this.getJSON.data.dataSets[0].observations) {
        this.observations = this.getJSON.data.dataSets[0].observations;
      } else {
        throw new Error("Series not found and observations empty");
      }
    }
    return this.observations;
  }

  /**
   * Get the annotations of the dataset
   * @return {Array} Annotations of the dataset in SDMX-JSON response
   */
  getAnnotations() {
    this.annotations = this.getStructure().annotations;

    return this.annotations;
  }

  /**
   * Get the parsed JSON data which will be used in the chart, table, card
   * @param {Object} options used to slice the dataset by dimension.
   * eg. options = { dimensionId: [dimensionValue1, dimensionValue2]}
   * @return {Array} Parsed data of the SDMX-JSON dataset
   */

  getData(options) {
    if (!this.getJSON) {
      throw new Error("Please load the api first");
    }
    const observations = this.getObservations();

    const dimensions = this.getDimensions();
    const attributes = this.getAttributes();

    let res = [];
    for (let key in observations) {
      const keyArray = key.split(":");
      // Coerce a numeric observation value delivered as a JSON string (some
      // providers, e.g. BIS, send OBS_VALUE as "2.41" rather than 2.41) to a
      // number, so consumers (charts, value cards) receive plotting-ready
      // numbers. Only non-empty numeric strings are converted; numbers, null
      // (missing), and non-numeric markers (e.g. confidentiality codes) pass
      // through unchanged so we never fabricate a 0 from null/"".
      const rawValue = observations[key][0];
      const value =
        typeof rawValue === "string" && rawValue.trim() !== "" && Number.isFinite(Number(rawValue))
          ? Number(rawValue)
          : rawValue;
      // the keyto object will contain the value of the observation and the dimensions and attributes values with their name
      const keyto = {
        value,
      };

      keyArray.forEach((_val, index) => {
        dimensions.find((val2, _index2) => {
          if (val2.keyPosition === index) {
            keyto[val2.id] = val2.values[keyArray[index]].name; // need to remove that name and send whole object
          }
        });
      });
      attributes.forEach((attribute, index) => {
        const observationVal = observations[key][index + 1] || 0;
        if (attribute.values[observationVal]) {
          keyto[attribute.id] = attribute.values[observationVal]?.name;
        }
      });
      res.push(keyto);
    }

    if (options) {
      const dimensionsId = dimensions.map((val) => val.id);
      Object.keys(options).forEach((val) => {
        if (!dimensionsId.includes(val)) {
          throw new Error(`provided key ${val} is not valid dimension`);
        }
      });
      Object.keys(options).forEach((key) => {
        res = res.filter((value) => options[key].includes(value[key]))
      })
    }

    return res;
  }
}
