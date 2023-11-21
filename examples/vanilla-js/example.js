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
    console.log(`🚀 ${selectedSample.name}`);
    await resp.getDatasets(
      selectedSample.url
    );
    const data = resp.getData();
    console.log("🚀 getData():", data);

    const observations = resp.getObservations();
    console.log("🚀 getObservations()", observations);

    const dimensions = resp.getDimensions();
    console.log("🚀 getDimensions()", dimensions);

    const id = dimensions[0]['id'];
    const dimension = resp.getDimension(id);
    console.log(`🚀 getDimension(${id})`, dimension);

    const activeDimensions = resp.getActiveDimensions();
    console.log("🚀 getActiveDimensions()", activeDimensions);

    const attributes = resp.getAttributes();
    console.log("🚀 getAttributes()", attributes);

    const name = resp.getName();
    console.log("🚀 getName()", name);

    const description = resp.getDescription();
    console.log("🚀 getDescription()", description);

    const annotations = resp.getAnnotations();
    console.log("🚀 getAnnotations()", annotations);

    const filter = { [activeDimensions[0]['id']]: activeDimensions[0]["values"].map(item => item.name).slice(0, 2) }
    const slice = resp.getData(filter);
    console.log(`🚀 getData(${JSON.stringify(filter)}):`, slice);
  }
})();
