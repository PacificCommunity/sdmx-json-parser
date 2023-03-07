
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
  async getName() {
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
  async getDescription() {
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
  async getAttributes() {
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

  async getDimensions() {
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
  async getRawDimesions() {
    const [observations, dimension] = await Promise.all([
      this.getObservations(),
      this.getDimensions(),
    ]);

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
  async getObservations() {
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
  async getAnnotations() {
    try {
      this.annotations = this.getJSON.data.structures[0].annotations;
    } catch (err) {
      throw new Error(err.response.data);
    }
    return this.annotations;
  }

  // TODO: need to set the JSON Data for chart, table, card.


  /**
  * @description get the JSON data which will be used in the chart, table, card
  * @returns {Array} data of the dataset
  */

  async getData() {
    try {
      const [observations, dimension] = await Promise.all([
        this.getObservations(),
        this.getDimensions(),
      ]);

      const incrementalDimensions = await this.getRawDimesions();
      let res = [];
      for (let key in observations) {
        const keyArray = key.split(":");
        let keyto = {};

        keyArray.forEach((_val, index) => {
          incrementalDimensions.find((val2, _index2) => {
            if (val2.keyPosition === index) {
              keyto[val2.id] = val2.values[keyArray[index]].name; // need to remove that name and send whole object
              keyto.value = observations[key][0];
              indexing++;
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
