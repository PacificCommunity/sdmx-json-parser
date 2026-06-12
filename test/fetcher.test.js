import test from "node:test";
import assert from "node:assert/strict";
import { SDMXParser } from "../index.mjs";

// Minimal SDMX-JSON 2.0 response, enough for getDatasets to parse.
const v2 = () => ({
  data: {
    structures: [
      {
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
      },
    ],
    dataSets: [{ action: "Information", observations: { "0": [42] } }],
  },
});

test("getDatasets routes the request through options.fetcher", async (t) => {
  const original = globalThis.fetch;
  let globalFetchCalls = 0;
  globalThis.fetch = async () => {
    globalFetchCalls += 1;
    return { status: 200, text: async () => JSON.stringify(v2()) };
  };
  t.after(() => {
    globalThis.fetch = original;
  });

  const seen = {};
  const fetcher = async (url, init) => {
    seen.url = String(url);
    seen.init = init;
    return { status: 200, text: async () => JSON.stringify(v2()) };
  };

  const parser = new SDMXParser();
  const headers = { Accept: "application/vnd.sdmx.data+json;version=2.0.0" };
  const json = await parser.getDatasets("https://example.org/rest/data/X,Y,1.0/all", {
    headers,
    fetcher,
  });

  // the request went through the fetcher, never through the global fetch
  assert.equal(globalFetchCalls, 0);
  assert.equal(seen.url, "https://example.org/rest/data/X,Y,1.0/all?format=jsondata");
  // the init passed on keeps the request options but no longer carries the fetcher
  assert.deepEqual(seen.init, { headers });
  // the response is parsed as usual
  assert.deepEqual(json.data.dataSets[0].observations, { "0": [42] });
});

test("getDatasets falls back to the global fetch without a fetcher", async (t) => {
  const original = globalThis.fetch;
  let globalFetchCalls = 0;
  globalThis.fetch = async () => {
    globalFetchCalls += 1;
    return { status: 200, text: async () => JSON.stringify(v2()) };
  };
  t.after(() => {
    globalThis.fetch = original;
  });

  const parser = new SDMXParser();
  await parser.getDatasets("https://example.org/rest/data/X,Y,1.0/all");
  assert.equal(globalFetchCalls, 1);
});
