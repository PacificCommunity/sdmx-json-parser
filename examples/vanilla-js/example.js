(async () => {
  const SDMXParser = parser.SDMXParser;
  const resp = new SDMXParser();
  console.log("🚀 ILO SDMX");
  await resp.getDatasets(
    "https://www.ilo.org/sdmx/rest/data/ILO,DF_EMP_TEMP_SEX_AGE_STE_NB,1.0/CHL.A..SEX_T.AGE_YTHADULT_YGE15.STE_ICSE93_6+STE_ICSE93_5+STE_ICSE93_4+STE_ICSE93_3+STE_ICSE93_2+STE_ICSE93_1?endPeriod=2022&lastNObservations=1&format=jsondata"
  );
  let res = resp.getData();
  console.log("🚀 ~ file: example.js:87 ~ res:", res);

  let observations = resp.getObservations();
  console.log("🚀 ~ file: example.js:90 ~ observations", observations);

  let dimensions = resp.getDimensions();
  console.log("🚀 ~ file: example.js:93 ~ dimensions", dimensions);

  let attributes = resp.getAttributes();
  console.log("🚀 ~ file: example.js:96 ~ attributes", attributes);

  let rawDimensions = resp.getRawDimensions();
  console.log("🚀 ~ file: example.js:99 ~ rawDimensions", rawDimensions);

  let name = resp.getName();
  console.log("🚀 ~ file: example.js:102 ~ name", name);

  let description = resp.getDescription();
  console.log("🚀 ~ file: example.js:105 ~ description", description);

  let annotations = resp.getAnnotations();
  console.log("🚀 ~ file: example.js:108 ~ annotations", annotations);

  let slice = resp.slice({ STE: ["STE_ICSE93_1", "STE_ICSE93_2"] });
  console.log("🚀 ~ file: example.js:36 ~ slice:", slice);

  console.log("🚀 SPC SDMX");
  await resp.getDatasets(
    "https://stats-nsi-stable.pacificdata.org/rest/data/SPC,DF_VAW,1.0/A..VAW_TOPIC_001......PARTNER.ALOLIFE.....?lastNObservations=1&dimensionAtObservation=AllDimensions&format=jsondata"
  );
  res = resp.getData();
  console.log("🚀 ~ file: example.js:87 ~ res:", res);

  observations = resp.getObservations();
  console.log("🚀 ~ file: example.js:90 ~ observations", observations);

  dimensions = resp.getDimensions();
  console.log("🚀 ~ file: example.js:93 ~ dimensions", dimensions);

  attributes = resp.getAttributes();
  console.log("🚀 ~ file: example.js:96 ~ attributes", attributes);

  rawDimensions = resp.getRawDimensions();
  console.log("🚀 ~ file: example.js:99 ~ rawDimensions", rawDimensions);

  name = resp.getName();
  console.log("🚀 ~ file: example.js:102 ~ name", name);

  description = resp.getDescription();
  console.log("🚀 ~ file: example.js:105 ~ description", description);

  annotations = resp.getAnnotations();
  console.log("🚀 ~ file: example.js:108 ~ annotations", annotations);

  slice = resp.slice({ GEO_PICT: ["TO", "FJ"] });
  console.log("🚀 ~ file: example.js:36 ~ slice:", slice);
})();
