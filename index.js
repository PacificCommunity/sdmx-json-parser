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
   * If the response contains series, the series are expanded to observations
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
   * Get the dimensions of the dataflow
   * If the response contains series, the series are expanded to dimensions observation
   * @return {Array} Dimensions of the dataset in SDMX-JSON response
   */
  getDimensions() {
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
