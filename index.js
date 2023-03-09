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
      getData;
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
   * @description slice out the given dimensions with the given value.
   * @param {object} containes dimensions name as a key and their respective values ids as an array in values
   */
  // slice(options) {
  //   const dim = this.getRawDimensions();
  //   const observations = this.getObservations();
  //   const keys = Object.keys(options);
  //   dim.forEach((val, index) => {
  //     keys.map((val2, index2) => {
  //       if (val2 === val.id) {
  //         val.values.map((val3, index3) => {
  //           options[val2].forEach((val4, index4) => {
  //             if (val3.id === val4) {
  //               for (let key in observations){
  //                 const keyArray = key.split(":");
  //                 keyArray.map((val5, index5) => {
  //                   if (val5 === index3){

  //                   }
  //                 })
  //               }
  //             }
  //           })
  //         })
  //       }
  //     });
  //   });

  // console.log("🚀 ~ file: index.js:161 ~ SDMXParser ~ slice ~ dim:", dim)
  // }

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
