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
      const parser = new JSONParser({paths: ["$.data.dataSets.*.series.*"]});
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
   * @param {String} api URL of the SDMX api
   * @param {Object} Options Request options used while fetching (optional)
   * @return {Array} SDMX-JSON response
   */
  async getDatasets(api, options = {}) {
    try {
      if (!api.includes("format=jsondata")) {
        api = `${api}&format=jsondata`;
      }
      const response = await fetch(api, options);
      if (response.status !== 200) {
        throw new Error(
          "Error while fetching data please provide valid api url"
        );
      }
      const txt = await response.text();
      const seriesObservations = this.parseSeriesInDatasets(txt);
      this.getJSON = JSON.parse(txt);
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
   * Get the name or title from the SDMX-JSON response
   * @return {String} Name or Title from the dataset
   */
  getName() {
    if (
      this.getJSON &&
      this.getJSON.data &&
      this.getJSON.data.structures[0] &&
      this.getJSON.data.structures[0].names
    ) {
      this.name = this.getJSON.data.structures[0].names.en;
    } else {
      throw new Error("Name not found");
    }

    return this.name;
  }

  /**
   * Get the Description or Subtitle from the SDMX-JSON response
   * @return {String} Description or Subtitle of the dataset
   */
  getDescription() {
    if (
      this.getJSON &&
      this.getJSON.data &&
      this.getJSON.data.structures[0] &&
      this.getJSON.data.structures[0].descriptions
    ) {
      this.descriptions = this.getJSON.data.structures[0].descriptions.en;
    } else {
      throw new Error("Description not found");
    }

    return this.descriptions;
  }

  /**
   * Get the Attributes from the SDMX-JSON response
   * @return {Array} Attributes of the dataset
   */
  getAttributes() {
    if (
      this.getJSON &&
      this.getJSON.data &&
      this.getJSON.data.structures[0] &&
      this.getJSON.data.structures[0].attributes
    ) {
      if (this.getJSON.data.structures[0].attributes.series.length > 0) {
        this.attributes = this.getJSON.data.structures[0].attributes.series;
        if (this.getJSON.data.structures[0].attributes.observation.length > 0) {
          this.attributes = this.attributes.concat(
            this.getJSON.data.structures[0].attributes.observation
          )
        }
      } else {
        this.attributes = this.getJSON.data.structures[0].attributes.observation;
      }
    } else {
      throw new Error("Attributes not found");
    }

    return this.attributes;
  }

  /**
   * Get the raw dimensions which can be use in axis
   * @return {Array} Dimensions which are in use for axis
   */

  getRawDimensions() {
    if (
      this.getJSON &&
      this.getJSON.data &&
      this.getJSON.data.structures[0] &&
      this.getJSON.data.structures[0].dimensions
    ) {
      if (this.getJSON.data.structures[0].dimensions.series.length > 0) {
        this.dimensions = this.getJSON.data.structures[0].dimensions.series;
        if (this.getJSON.data.structures[0].dimensions.observation.length > 0) {
          this.dimensions = this.dimensions.concat(
            this.getJSON.data.structures[0].dimensions.observation
          )
        }
      } else {
        this.dimensions = this.getJSON.data.structures[0].dimensions.observation;
      }
    } else {
      throw new Error("Dimensions not found");
    }
    return this.dimensions;
  }

  /**
   *
   * Get all the dimensions which are used for getting values from the SDMX-JSON response
   * @param {String} options Dimension id to get only specific dimension (optional)
   * @return {Array} Active Dimensions of the dataset
   */
  getDimensions(options) {
    if (options) {
      const rawDimensions = this.getRawDimensions();
      const dimensions = rawDimensions.filter((val, _index) => {
        return val.id === options;
      });
      if (!dimensions.length) {
        throw new Error("Dimension not found");
      }
      return dimensions;
    }
    const [dimension, observations] = [
      this.getRawDimensions(),
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
   * @return {Object} Observations of the dataset
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
   * @return {Array} Annotations of the dataset
   */
  getAnnotations() {
    if (
      this.getJSON &&
      this.getJSON.data &&
      this.getJSON.data.structures[0] &&
      this.getJSON.data.structures[0].annotations
    ) {
      this.annotations = this.getJSON.data.structures[0].annotations;
    } else {
      throw new Error("Annotations not found");
    }

    return this.annotations;
  }

  /**
   * Slice by dimensions with their respective values from the SDMX-JSON response
   * @param {Object} options Contains the dimension and the values to be sliced
   * @return {Array} Contains all the dimensions with their respective values also have measure and attributes
   */
  slice(options) {
    const observations = this.getObservations(); //  provides object
    const dimensions = this.getRawDimensions(); // provides array  of objects
    const attributes = this.getAttributes(); // provides array of objects
    let dimensionKeys = [];
    let result = [];
    let indexing = 0;
    const allKeys = [];
    const dimensionsId = dimensions.map((val) => val.id);
    Object.keys(options).forEach((val) => {
      if (!dimensionsId.includes(val)) {
        throw new Error(`provided key ${val} is not valid dimension`);
      }
    });
    dimensions.map((val, _index) => {
      if (Object.keys(options).includes(val.id)) {
        dimensionKeys.push({
          name: val.id,
          keyPosition: val.keyPosition,
          value: val.values,
          index: [],
        });
      }
    });

    dimensionKeys.map((val, _index) => {
      val.value.map((val2, index2) => {
        if (options[val.name].includes(val2.id)) {
          val.index.push(index2);
        }
      });
      delete val.value;
    });

    // add the sdmxKeys to the respective dimensionKeys
    Object.keys(observations).map((val, _index) => {
      const keyArray = val.split(":");
      dimensionKeys.forEach((val2, index2) => {
        if (val2.index.includes(Number(keyArray[val2.keyPosition]))) {
          if (!val2.sdmxKeys) {
            val2.sdmxKeys = [keyArray];
          } else {
            val2.sdmxKeys.push(keyArray);
          }
        }
      });
    });

    dimensionKeys.forEach((val) => {
      allKeys.push(...val.sdmxKeys);
    });

    let count = attributes.length;
    allKeys.forEach((val, index) => {
      let key = val.join(":");
      result.push({
        dimensions: { sdmxKeys: val },
        measure: observations[key][0],
        attributes: {},
      });
      for (let i = 0; i < count; i++) {
        result[index].attributes[attributes[i].id] = attributes[i].values[
          observations[key][i + 1]
        ]
          ? {
              id: attributes[i].values[observations[key][i + 1]].id,
              name: attributes[i].values[observations[key][i + 1]].name,
            }
          : null;
      }

      val.forEach((val2, index2) => {
        result[indexing].dimensions[dimensions[index2].id] = {
          id: dimensions[index2].values[val2].id,
          name: dimensions[index2].values[val2].name,
        };
      });
      indexing++;
    });
    return result;
  }

  // TODO: need to set the JSON Data for chart, table, card.

  /**
   * Get the parsed JSON data which will be used in the chart, table, card
   * @return {Array} Parsed data of the SDMX-JSON dataset
   */

  getData() {
    if (!this.getJSON) {
      throw new Error("Please load the api first");
    }
    const observations = this.getObservations();

    const dimensions = this.getRawDimensions();
    const attributes = this.getAttributes();

    let res = [];
    for (let key in observations) {
      const keyArray = key.split(":");
      let keyto = {};

      keyArray.forEach((_val, index) => {
        dimensions.find((val2, _index2) => {
          if (val2.keyPosition === index) {
            keyto[val2.id] = val2.values[keyArray[index]].name; // need to remove that name and send whole object
            keyto.value = observations[key][0];
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

    return res;
  }
}
