(async () => {
  const SDMXParser = parser.SDMXParser;
  const resp = new SDMXParser();
  const test_samples = [{
      name: "ILO SDMX (observations)",
      value: "ilo_obs",
      url: "https://www.ilo.org/sdmx/rest/data/ILO,DF_EMP_TEMP_SEX_AGE_STE_NB,1.0/CHL.A..SEX_T.AGE_YTHADULT_YGE15.STE_ICSE93_6+STE_ICSE93_5+STE_ICSE93_4+STE_ICSE93_3+STE_ICSE93_2+STE_ICSE93_1?endPeriod=2022&lastNObservations=1&format=jsondata"
    }, {
      name: "ILO SDMX (series)",
      value: "ilo_ser",
      url: "https://www.ilo.org/sdmx/rest/data/ILO,DF_EAP_DWAP_SEX_AGE_RT,1.0/CHL.A..SEX_O+SEX_F+SEX_M+SEX_T.AGE_YTHADULT_YGE15?startPeriod=2010&endPeriod=2022"
    }, {
      name: "SPC SDMX (observations)",
      value: "spc_obs",
      url: "https://stats-nsi-stable.pacificdata.org/rest/data/SPC,DF_VAW,1.0/A..VAW_TOPIC_001......PARTNER.ALOLIFE.....?lastNObservations=1&dimensionAtObservation=AllDimensions&format=jsondata"
    }, {
      name: "ILO SDMX (single value)",
      value: "ilo_single",
      url: "https://www.ilo.org/sdmx/rest/data/ILO,DF_UNE_DEAP_SEX_AGE_RT,1.0/CHL.A..SEX_T.AGE_YTHADULT_YGE15?endPeriod=2022&lastNObservations=1"
    }, {
      name: "Uruguay SDMX (dimensions dataSet level)",
      value: "uy_dataset",
      url: "https://sdmx-mtss.simel.mtss.gub.uy/rest/data/UY110,DF_MFAUN_CCSS,1.0/.A.._T?lastNObservations=1&format=jsondata"
    }
  ]

  const select = document.getElementById("sample-select");
  test_samples.forEach(sample => {
    const option = document.createElement("option");
    option.value = sample.value;
    option.text = sample.name;
    select.appendChild(option);
  });
  select.addEventListener("change", handleSelectChange);
  select.value = test_samples[0].value;
  handleSelectChange();

  async function handleSelectChange() {
    const selectedValue = document.getElementById("sample-select").value;
    const selectedSample = test_samples.find(sample => sample.value === selectedValue);
    console.log(`🚀🚀🚀 ${selectedSample.name}`);
    await resp.getDatasets(
      selectedSample.url
    );
    try {
      const data = resp.getData();
      console.log("🚀 getData():", data);
    }
    catch (error) {
      console.log(error);
    }

    try {
      const observations = resp.getObservations();
      console.log("🚀 getObservations()", observations);
    }
    catch (error) {
      console.log(error);
    }

    try {
      const dimensions = resp.getDimensions();
      console.log("🚀 getDimensions()", dimensions);
    }
    catch (error) {
      console.log(error);
    }

    try {
      const dimensions = resp.getDimensions();
      if (dimensions.length === 0) {
        return;
      }
      const id = dimensions[0]['id'];
      const dimension = resp.getDimension(id);
      console.log(`🚀 getDimension(${id})`, dimension);
    }
    catch (error) {
      console.log(error);
    }

    try {
      const activeDimensions = resp.getActiveDimensions();
      console.log("🚀 getActiveDimensions()", activeDimensions);
    }
    catch (error) {
      console.log(error);
    }

    try {
      const attributes = resp.getAttributes();
      console.log("🚀 getAttributes()", attributes);
    }
    catch (error) {
      console.log(error);
    }

    try {
      const name = resp.getName();
      console.log("🚀 getName()", name);
    }
    catch (error) {
      console.log(error);
    }

    try {
      const description = resp.getDescription();
      console.log("🚀 getDescription()", description);
    }
    catch (error) {
      console.log(error);
    }

    try {
      const annotations = resp.getAnnotations();
      console.log("🚀 getAnnotations()", annotations);
    }
    catch (error) {
      console.log(error);
    }

    try {
      const activeDimensions = resp.getActiveDimensions();
      if (activeDimensions.length === 0) {
        return;
      }
      const filter = { [activeDimensions[0]['id']]: activeDimensions[0]["values"].map(item => item.name).slice(0, 2) }
      const slice = resp.getData(filter);
      console.log(`🚀 getData(${JSON.stringify(filter)}):`, slice);
    }
    catch (error) {
      console.log(error);
    }
  }
})();
