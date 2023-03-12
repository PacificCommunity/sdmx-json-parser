export class SDMXParser {
  /**
   *  initializing the global variable using constructor
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
   *
   * @description get the SDMX JSON dataSet from the api
   * @param {string} api
   * @param {Object} Optional request options as in fetch()
   * @returns  SDMX JSON response
   */
  async getDatasets(api, options = {}) {
    try {
      const response = await fetch(api, options);
      this.getJSON = await response.json();
      // this.getJSON = await axios.get(api, options);
    } catch (err) {
      throw new Error(err.response.data);
    }
    return this.getJSON;
  }

  /**
   * @description get the name from the SDMX JSON response
   * @returns {string} name of the dataset
   */
  getName() {
    try {
      this.name = this.getJSON.data.structures[0].names.en;
    } catch (err) {
      throw new Error(err.response.data);
    }
    return this.name;
  }

  /**
   * @description get the description from the SDMX JSON response
   * @returns {string} description of the dataset
   */
  getDescription() {
    try {
      this.descriptions = this.getJSON.data.structures[0].descriptions.en;
    } catch (err) {
      throw new Error(err.response.data);
    }
    return this.descriptions;
  }

  /**
   * @description get the attributes from the SDMX JSON response
   * @returns {Array} attributes of the dataset
   */
  getAttributes() {
    try {
      this.attributes = this.getJSON.data.structures[0].attributes.observation;
    } catch (err) {
      throw new Error(err.response.data);
    }

    return this.attributes;
  }

  /**
   * @description get the raw dimensions which are in use for the data
   * @returns {Array} dimensions which are in use for the data
   */

  getRawDimensions() {
    try {
      this.dimensions = this.getJSON.data.structures[0].dimensions.observation;
    } catch (err) {
      throw new Error(err.response.data);
    }
    return this.dimensions;
  }

  /**
   *
   * @description get the dimensions from the SDMX JSON response
   * @returns {Array} all dimensions of the dataset
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
    const [observations, dimension] = [
      this.getObservations(),
      this.getRawDimensions(),
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
   * @description get the observations from the SDMX JSON response
   * @returns {Array} observations of the dataset
   */
  getObservations() {
    try {
      if (
        this.getJSON.data.dataSets &&
        this.getJSON.data.dataSets[0].observations
      ) {
        this.observations = this.getJSON.data.dataSets[0].observations;
      } else {
        this.observations = "No Data Found";
      }
    } catch (err) {
      throw new Error(err);
    }
    return this.observations;
  }

  /**
   * @description get the annotations of the dataset
   * @returns {Array} annotations of the dataset
   */
  getAnnotations() {
    try {
      this.annotations = this.getJSON.data.structures[0].annotations;
    } catch (err) {
      throw new Error(err.response.data);
    }
    return this.annotations;
  }

  /**
   * @description  get the data from the SDMX JSON response
   * @param {Object} options contains the dimension and the values to be sliced
   */
  slice(options) {
    const observations = this.getObservations();
    const dimensions = this.getRawDimensions();
    const attributes = this.getAttributes();
    let dimensionKeys = [];
    let result = [];
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
    let indexing = 0;
    dimensionKeys.forEach((val, _index) => {
      val.sdmxKeys.forEach((val2, _index2) => {
        result.push({ dimensions: { sdmxKeys: val2 }});
        val2.forEach((val3, index3) => {
          result[indexing].dimensions[dimensions[index3].id] = {
              id: dimensions[index3].values[val3].id,
              name: dimensions[index3].values[val3].name,
            };
          });
          indexing++;
        });
      });
      
   

    let count = attributes.length;
    result.forEach((val, _index) => {
      for (let key in observations) {
        if (key === val.dimensions.sdmxKeys.join(":")) {
          val.measure = observations[key][0];
          val.attributes = {};
          for (let i = 0; i < count; i++) {
            val.attributes[attributes[i].id] = attributes[i].values[
              observations[key][i + 1]
            ]
              ? {
                  id: attributes[i].values[observations[key][i + 1]].id,
                  name: attributes[i].values[observations[key][i + 1]].name,
                }
              : null;
          }
        }
      }
    });
    return result;
  }

  // TODO: need to set the JSON Data for chart, table, card.

  /**
   * @description get the JSON data which will be used in the chart, table, card
   * @returns {Array} data of the dataset
   */

  getData() {
    try {
      const observations = this.getObservations();

      const incrementalDimensions = this.getDimensions();
      let res = [];
      for (let key in observations) {
        const keyArray = key.split(":");
        let keyto = {};

        keyArray.forEach((_val, index) => {
          incrementalDimensions.find((val2, _index2) => {
            if (val2.keyPosition === index) {
              keyto[val2.id] = val2.values[keyArray[index]].name; // need to remove that name and send whole object
              keyto.value = observations[key][0];
            }
          });
        });
        res.push(keyto);
      }

      return res;
    } catch (error) {
      return error;
    }
  }
}
