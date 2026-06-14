import test from "node:test";
import assert from "node:assert/strict";
import { SDMXParser } from "../index.mjs";

// ---------------------------------------------------------------------------
// Fixtures: the same one-observation dataset in the three shapes seen in the
// wild. `format=jsondata` yields 2.0 on some providers (ABS, older .Stat
// builds), the 1.0 `data` envelope on current .Stat builds (Pacific Data Hub,
// Samoa Bureau of Statistics), and the 1.0 root dialect on ECB.
// ---------------------------------------------------------------------------

const structureV2 = () => ({
  name: "Test flow",
  names: { en: "Test flow" },
  dimensions: {
    dataSet: [],
    series: [],
    observation: [
      { id: "TIME_PERIOD", name: "Time", keyPosition: 0, values: [{ id: "2024", name: "2024" }] },
    ],
  },
  attributes: { dataSet: [], dimensionGroup: [], series: [], observation: [] },
});

const v2 = () => ({
  data: {
    structures: [structureV2()],
    dataSets: [{ action: "Information", observations: { "0": [42] } }],
  },
});

// .Stat 1.0 envelope: singular `structure`, lowercase `dataset` dimension
// group, missing attribute groups.
const v1DotStat = () => ({
  data: {
    structure: {
      name: "Test flow",
      names: { en: "Test flow" },
      dimensions: {
        dataset: [],
        observation: [
          { id: "TIME_PERIOD", name: "Time", keyPosition: 0, values: [{ id: "2024", name: "2024" }] },
        ],
      },
      attributes: { observation: [] },
    },
    dataSets: [{ action: "Information", observations: { "0": [42] } }],
  },
});

// ECB 1.0 root dialect: no `data` envelope, singular `name` only (no
// localised `names` object — the normaliser synthesises it).
const v1Root = () => ({
  header: { id: "test" },
  structure: {
    name: "Test flow",
    dimensions: {
      series: [
        { id: "FREQ", name: "Frequency", keyPosition: 0, values: [{ id: "A", name: "Annual" }] },
      ],
      observation: [
        { id: "TIME_PERIOD", name: "Time", values: [{ id: "2024", name: "2024" }] },
      ],
    },
    attributes: { series: [], observation: [] },
  },
  dataSets: [
    { action: "Replace", series: { "0": { observations: { "0": [42] } } } },
  ],
});

// ---------------------------------------------------------------------------
// normalizeSdmxJson
// ---------------------------------------------------------------------------

test("2.0 responses pass through untouched (idempotence)", () => {
  const input = v2();
  const reference = v2();
  const out = SDMXParser.normalizeSdmxJson(input);
  assert.deepEqual(out, reference);
  // A second pass changes nothing either.
  assert.deepEqual(SDMXParser.normalizeSdmxJson(out), reference);
});

test(".Stat 1.0 envelope is reshaped to 2.0", () => {
  const out = SDMXParser.normalizeSdmxJson(v1DotStat());
  assert.equal(out.data.structure, undefined);
  assert.ok(Array.isArray(out.data.structures));
  const dims = out.data.structures[0].dimensions;
  assert.equal(dims.dataset, undefined);
  assert.deepEqual(dims.dataSet, []);
  assert.deepEqual(dims.series, []);
  assert.equal(dims.observation.length, 1);
  const attrs = out.data.structures[0].attributes;
  assert.deepEqual(attrs.dataSet, []);
  assert.deepEqual(attrs.dimensionGroup, []);
  assert.deepEqual(attrs.series, []);
});

test("ECB 1.0 root dialect is wrapped and reshaped to 2.0", () => {
  const out = SDMXParser.normalizeSdmxJson(v1Root());
  assert.equal(out.dataSets, undefined);
  assert.equal(out.structure, undefined);
  assert.ok(Array.isArray(out.data.structures));
  assert.equal(out.data.structures[0].dimensions.series.length, 1);
  assert.deepEqual(out.data.structures[0].dimensions.dataSet, []);
  assert.ok(out.data.dataSets[0].series);
});

test("keyPosition is synthesised when the root dialect omits it", () => {
  // ECB carries no keyPosition on any dimension; getData needs it to map
  // observation-key positions to dimensions
  const out = SDMXParser.normalizeSdmxJson(v1Root());
  const dims = out.data.structures[0].dimensions;
  assert.equal(dims.series[0].id, "FREQ");
  assert.equal(dims.series[0].keyPosition, 0);
  assert.equal(dims.observation[0].id, "TIME_PERIOD");
  assert.equal(dims.observation[0].keyPosition, 1);
});

test("existing keyPosition values are preserved (idempotent)", () => {
  const two = structureV2();
  // 2.0 observation dim already carries keyPosition 0; must be kept
  const out = SDMXParser.normalizeSdmxJson(v2());
  assert.equal(out.data.structures[0].dimensions.observation[0].keyPosition, 0);
  void two;
});

test("objects without SDMX markers are returned unchanged", () => {
  assert.deepEqual(SDMXParser.normalizeSdmxJson({ hello: 1 }), { hello: 1 });
  assert.equal(SDMXParser.normalizeSdmxJson(null), null);
});

// ---------------------------------------------------------------------------
// getDatasets end to end, with fetch stubbed
// ---------------------------------------------------------------------------

function stubFetch(t, body, capture) {
  const original = globalThis.fetch;
  globalThis.fetch = async (url, options) => {
    if (capture) {
      capture.url = String(url);
      capture.options = options;
    }
    return { status: 200, text: async () => JSON.stringify(body) };
  };
  t.after(() => {
    globalThis.fetch = original;
  });
}

test("getDatasets appends format=jsondata with the right separator", async (t) => {
  const capture = {};
  stubFetch(t, v2(), capture);
  const parser = new SDMXParser();
  await parser.getDatasets("https://example.org/rest/data/X,Y,1.0/all");
  assert.ok(capture.url.endsWith("?format=jsondata"));
  await parser.getDatasets("https://example.org/rest/data/X,Y,1.0/all?startPeriod=2020");
  assert.ok(capture.url.endsWith("&format=jsondata"));
});

test("getDatasets parses a .Stat 1.0 envelope response", async (t) => {
  stubFetch(t, v1DotStat());
  const parser = new SDMXParser();
  await parser.getDatasets("https://example.org/rest/data/X,Y,1.0/all");
  assert.equal(parser.getName(), "Test flow");
  assert.equal(parser.getDimensions().length, 1);
  assert.deepEqual(parser.getObservations(), { "0": [42] });
});

test("getDatasets parses an ECB root-dialect response with series expansion", async (t) => {
  stubFetch(t, v1Root());
  const parser = new SDMXParser();
  const json = await parser.getDatasets("https://example.org/service/data/ECB,EXR,1.0/all");
  // Series were streamed from the root path and expanded to observations.
  assert.deepEqual(json.data.dataSets[0].observations, { "0:0": [42] });
  assert.equal(json.data.dataSets[0].series, undefined);
  assert.equal(parser.getName(), "Test flow");
  // Dimensions concatenate series + observation groups.
  assert.equal(parser.getDimensions().length, 2);
});

test("getDatasets parses a 2.0 response unchanged", async (t) => {
  stubFetch(t, v2());
  const parser = new SDMXParser();
  const json = await parser.getDatasets("https://example.org/rest/data/X,Y,1.0/all");
  assert.deepEqual(json.data.dataSets[0].observations, { "0": [42] });
  assert.equal(parser.getName(), "Test flow");
});
