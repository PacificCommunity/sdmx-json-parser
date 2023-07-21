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
  const input = document.getElementById("sample-url");
  input.addEventListener("keydown", handleInputChange);

  async function loadSDMX(url) {
    try {
      await resp.getDatasets(
        url
      );
      document.getElementById("sample-name").textContent = resp.getName();
      document.getElementById("sample-description").innerHTML = resp.getDescription();
      var jsonViewerDimensions = new JSONViewer();
      document.getElementById("json-content-dimensions").innerHTML = "";
      document.getElementById("json-content-dimensions").appendChild(jsonViewerDimensions.getContainer());
      jsonViewerDimensions.showJSON(resp.getDimensions(), -1, 0);
      var jsonViewerAttributes = new JSONViewer();
      document.getElementById("json-content-attributes").innerHTML = "";
      document.getElementById("json-content-attributes").appendChild(jsonViewerAttributes.getContainer());
      jsonViewerAttributes.showJSON(resp.getAttributes(), -1, 0);
      var jsonViewerAnnotations = new JSONViewer();
      document.getElementById("json-content-annotations").innerHTML = "";
      document.getElementById("json-content-annotations").appendChild(jsonViewerAnnotations.getContainer());
      jsonViewerAnnotations.showJSON(resp.getAnnotations(), -1, 0);
      var jsonViewerObservations = new JSONViewer();
      document.getElementById("json-content-observations").innerHTML = "";
      document.getElementById("json-content-observations").appendChild(jsonViewerObservations.getContainer());
      jsonViewerObservations.showJSON(resp.getObservations(), -1, 0);
      var jsonViewerData = new JSONViewer();
      document.getElementById("json-content-data").innerHTML = "";
      document.getElementById("json-content-data").appendChild(jsonViewerData.getContainer());
      jsonViewerData.showJSON(resp.getData(), -1, 0);

      let res = resp.getData();
      console.log("🚀 ~ file: example.js:38 ~ res:", res);

      let observations = resp.getObservations();
      console.log("🚀 ~ file: example.js:41 ~ observations", observations);

      let dimensions = resp.getDimensions();
      console.log("🚀 ~ file: example.js:44 ~ dimensions", dimensions);

      let attributes = resp.getAttributes();
      console.log("🚀 ~ file: example.js:47 ~ attributes", attributes);

      let rawDimensions = resp.getRawDimensions();
      console.log("🚀 ~ file: example.js:50 ~ rawDimensions", rawDimensions);

      let name = resp.getName();
      console.log("🚀 ~ file: example.js:53 ~ name", name);

      let description = resp.getDescription();
      console.log("🚀 ~ file: example.js:56 ~ description", description);

      let annotations = resp.getAnnotations();
      console.log("🚀 ~ file: example.js:59 ~ annotations", annotations);

      let slice = resp.slice({ [dimensions[0]['id']]: dimensions[0]["values"].map(item => item.id).slice(0, 2) });
      console.log("🚀 ~ file: example.js:62 ~ slice:", slice);
    } catch (e) {
      document.getElementById("sample-name").textContent = '';
      document.getElementById("sample-description").innerHTML = '';
      document.getElementById("json-content-dimensions").innerHTML = "";
      document.getElementById("json-content-attributes").innerHTML = "";
      document.getElementById("json-content-annotations").innerHTML = "";
      document.getElementById("json-content-observations").innerHTML = "";
      document.getElementById("json-content-data").innerHTML = "";
      alert(`URL is not valid: ${url}`);
      return;
    }

  }

  async function handleInputChange(e) {
      if(e.keyCode == 13) {
        loadSDMX(e.target.value);
      }
  }

  async function handleSelectChange() {
    const selectedValue = document.getElementById("sample-select").value;
    const selectedSample = test_samples.find(sample => sample.value === selectedValue);
    document.getElementById("sample-url").value = selectedSample.url;
    loadSDMX(selectedSample.url);
  }
})();
