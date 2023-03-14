
(async () => {
  const SDMXParser = parser.SDMXParser
  const resp = new SDMXParser();
  await resp.getDatasets(
    "https://stats-nsi-stable.pacificdata.org/rest/data/SPC,DF_VAW,1.0/A..VAW_TOPIC_001......PARTNER.ALOLIFE.....?lastNObservations=1&dimensionAtObservation=AllDimensions&format=jsondata"
  );
  const res = resp.getData();
  console.log("🚀 ~ file: example.js:87 ~ res:", res);

  const observations = resp.getObservations();
  console.log("🚀 ~ file: example.js:90 ~ observations", observations);

  const dimensions = resp.getDimensions();
  console.log("🚀 ~ file: example.js:93 ~ dimensions", dimensions);

  const attributes = resp.getAttributes();
  console.log("🚀 ~ file: example.js:96 ~ attributes", attributes);

  const rawDimensions = resp.getRawDimensions();
  console.log("🚀 ~ file: example.js:99 ~ rawDimensions", rawDimensions);

  const name = resp.getName();
  console.log("🚀 ~ file: example.js:102 ~ name", name);

  const description = resp.getDescription();
  console.log("🚀 ~ file: example.js:105 ~ description", description);

  const annotations = resp.getAnnotations();
  console.log("🚀 ~ file: example.js:108 ~ annotations", annotations);

  const slice = resp.slice({ GEO_PICT: ["TO"] });
  console.log("🚀 ~ file: example.js:31 ~ slice:", slice);
})();
