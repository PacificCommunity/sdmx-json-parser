const test = require("node:test");
const assert = require("node:assert/strict");
const { SDMXParser } = require("../dist/parser.js");

// ---------------------------------------------------------------------------
// Fixtures: one observation in the three dialects seen live across the MCP
// providers. v2.0 envelope (FBOS/ILO/ABS/OECD), v1.0 envelope (SPC/SBS/
// UNICEF/BIS), v1.0 root (ECB).
// ---------------------------------------------------------------------------
const v2 = () => ({
  data: {
    structures: [{
      name: "Flow", names: { en: "Flow" },
      dimensions: {
        dataSet: [], series: [],
        observation: [{ id: "TIME_PERIOD", name: "t", keyPosition: 0, values: [{ id: "2024", name: "2024" }] }],
      },
      attributes: { dataSet: [], dimensionGroup: [], series: [], observation: [] },
    }],
    dataSets: [{ action: "Information", observations: { "0": [42] } }],
  },
});
const v1env = () => ({
  data: {
    structure: {
      name: "Flow", names: { en: "Flow" },
      dimensions: { observation: [{ id: "TIME_PERIOD", name: "t", keyPosition: 0, values: [{ id: "2024", name: "2024" }] }] },
      attributes: { observation: [] },
    },
    dataSets: [{ action: "Information", observations: { "0": [42] } }],
  },
});
// ECB root: no data envelope, series at root, NO keyPosition anywhere
const v1root = () => ({
  header: { id: "x" },
  structure: {
    name: "Flow",
    dimensions: {
      series: [{ id: "FREQ", name: "Freq", values: [{ id: "A", name: "Annual" }] }],
      observation: [{ id: "TIME_PERIOD", name: "t", values: [{ id: "2024", name: "2024" }] }],
    },
    attributes: { series: [], observation: [] },
  },
  dataSets: [{ action: "Replace", series: { "0": { observations: { "0": [42] } } } }],
});

// fetch-like Response stub
const resp = (status, body, ct = "application/vnd.sdmx.data+json") => ({
  status,
  headers: { get: (h) => (h.toLowerCase() === "content-type" ? ct : null) },
  text: async () => (typeof body === "string" ? body : JSON.stringify(body)),
});

// ---------------------------------------------------------------------------
// normalizeShape
// ---------------------------------------------------------------------------
test("normalizeShape wraps the v1.0 root dialect into a data envelope", () => {
  const p = new SDMXParser();
  const out = p.normalizeShape(v1root());
  assert.equal(out.structure, undefined);
  assert.equal(out.dataSets, undefined);
  assert.ok(out.data.structure);
  assert.ok(out.data.dataSets);
});

test("normalizeShape synthesises keyPosition (series then observation) when absent", () => {
  const p = new SDMXParser();
  const out = p.normalizeShape(v1root());
  const dims = out.data.structure.dimensions;
  assert.equal(dims.series[0].id, "FREQ");
  assert.equal(dims.series[0].keyPosition, 0);
  assert.equal(dims.observation[0].id, "TIME_PERIOD");
  assert.equal(dims.observation[0].keyPosition, 1);
});

test("normalizeShape preserves existing keyPosition and 2.0/envelope shapes (idempotent)", () => {
  const p = new SDMXParser();
  const out = p.normalizeShape(v2());
  assert.equal(out.data.structures[0].dimensions.observation[0].keyPosition, 0);
  // non-SDMX object untouched
  assert.deepEqual(p.normalizeShape({ hello: 1 }), { hello: 1 });
});

// ---------------------------------------------------------------------------
// two-step request negotiation (via the fetcher seam)
// ---------------------------------------------------------------------------
function recordingFetcher(handler) {
  const calls = [];
  const fetcher = async (url, init) => {
    const accept = new Headers(init.headers || {}).get("Accept");
    calls.push({ url, accept });
    return handler(url, accept);
  };
  return { fetcher, calls };
}

test("primary request sends format=jsondata + Accept v1.0 and is used when it succeeds", async (t) => {
  const { fetcher, calls } = recordingFetcher(() => resp(200, v2()));
  const p = new SDMXParser();
  await p.getDatasets("https://x/rest/data/A/all", { fetcher, headers: new Headers({ "Accept-Language": "en" }) });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].accept, "application/vnd.sdmx.data+json;version=1.0.0");
  assert.ok(calls[0].url.includes("format=jsondata"));
});

test("falls back to bare format=jsondata when the primary 406s (the ECB case)", async () => {
  const { fetcher, calls } = recordingFetcher((url, accept) => (accept ? resp(406, "<error/>", "application/xml") : resp(200, v1root())));
  const p = new SDMXParser();
  const json = await p.getDatasets("https://x/service/data/EXR/all", { fetcher, headers: new Headers({ "Accept-Language": "en" }) });
  assert.equal(calls.length, 2);
  assert.equal(calls[0].accept, "application/vnd.sdmx.data+json;version=1.0.0");
  assert.equal(calls[1].accept, null);
  // and the root dialect parsed through
  assert.ok(json.data.structure);
  assert.deepEqual(p.getData()[0].TIME_PERIOD, "2024");
});

test("falls through 200-but-XML responses to the application/json attempt (the IMF case)", async () => {
  // IMF returns HTTP 200 XML to format=jsondata and the v1.0 Accept, and only
  // serves SDMX-JSON (root dialect) for a generic Accept: application/json
  const { fetcher, calls } = recordingFetcher((url, accept) => {
    if (accept === "application/json") return resp(200, v1root(), "application/json");
    return resp(200, "<message/>", "application/xml"); // 200 but XML
  });
  const p = new SDMXParser();
  await p.getDatasets("https://api.imf.org/external/sdmx/2.1/data/X/all", { fetcher, headers: new Headers({ "Accept-Language": "en" }) });
  assert.deepEqual(calls.map((c) => c.accept), [
    "application/vnd.sdmx.data+json;version=1.0.0",
    null,
    "application/json",
  ]);
  assert.equal(p.getData()[0].TIME_PERIOD, "2024");
});

test("a caller-supplied Accept disables negotiation (single request)", async () => {
  const { fetcher, calls } = recordingFetcher(() => resp(200, v2()));
  const p = new SDMXParser();
  await p.getDatasets("https://x/rest/data/A/all", { fetcher, headers: new Headers({ Accept: "application/json" }) });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].accept, "application/json");
});

test("appends format=jsondata with the right separator", async () => {
  const seen = [];
  const fetcher = async (url) => { seen.push(url); return resp(200, v2()); };
  await new SDMXParser().getDatasets("https://x/rest/data/A/all", { fetcher });
  await new SDMXParser().getDatasets("https://x/rest/data/A/all?startPeriod=2020", { fetcher });
  assert.ok(seen[0].endsWith("?format=jsondata"));
  assert.ok(seen[1].endsWith("&format=jsondata"));
});

test("coerces numeric string OBS_VALUE to a number; leaves null and non-numeric markers", async () => {
  const fixture = () => ({
    data: {
      structures: [{
        name: "F", names: { en: "F" },
        dimensions: {
          dataSet: [], series: [],
          observation: [{ id: "TIME_PERIOD", name: "t", keyPosition: 0, values: [
            { id: "2022", name: "2022" }, { id: "2023", name: "2023" }, { id: "2024", name: "2024" },
          ] }],
        },
        attributes: { dataSet: [], dimensionGroup: [], series: [], observation: [] },
      }],
      dataSets: [{ observations: { "0": ["2.41"], "1": [null], "2": ["confidential"] } }],
    },
  });
  const p = new SDMXParser();
  await p.getDatasets("https://x/rest/data/A/all", { fetcher: async () => resp(200, fixture()) });
  const byTime = Object.fromEntries(p.getData().map((r) => [r.TIME_PERIOD, r.value]));
  assert.equal(byTime["2022"], 2.41);                 // numeric string -> number
  assert.equal(typeof byTime["2022"], "number");
  assert.equal(byTime["2023"], null);                 // null stays null (NOT 0)
  assert.equal(byTime["2024"], "confidential");        // non-numeric marker untouched
});

// ---------------------------------------------------------------------------
// end-to-end parse of each dialect
// ---------------------------------------------------------------------------
for (const [name, fixture, expectName] of [
  ["v2.0 envelope", v2, "Flow"],
  ["v1.0 envelope", v1env, "Flow"],
  ["v1.0 root", v1root, "Flow"],
]) {
  test(`getDatasets parses the ${name} dialect end to end`, async () => {
    const fetcher = async () => resp(200, fixture());
    const p = new SDMXParser();
    await p.getDatasets("https://x/rest/data/A/all", { fetcher });
    assert.equal(p.getName(), expectName);
    const data = p.getData();
    assert.equal(data.length, 1);
    assert.equal(data[0].value, 42);
    assert.equal(data[0].TIME_PERIOD, "2024");
  });
}
