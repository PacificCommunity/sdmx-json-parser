const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { SDMXParser } = require("../dist/parser.js");

// Real data responses captured on 2 Nov 2026 through the parser's own
// negotiation (Accept-Language: en, no caller Accept); one per provider.
// Content types are the ones each provider answered with.
const providers = {
  spc: "application/vnd.sdmx.data+json; version=1.0; charset=utf-8",
  sbs: "application/vnd.sdmx.data+json; charset=utf-8; version=1.0",
  fbos: "application/vnd.sdmx.data+json; version=2.0; charset=utf-8",
  oecd: "application/vnd.sdmx.data+json; version=1.0; charset=utf-8",
  ilo: "application/vnd.sdmx.data+json; version=2; charset=utf-8",
  abs: "application/vnd.sdmx.data+json; version=2; charset=utf-8",
  unicef: "application/json;charset=UTF-8",
  bis: "application/json;charset=UTF-8",
  ecb: "application/vnd.sdmx.data+json;version=1.0.0-wd",
  imf: "application/json",
};

const load = (name) => fs.readFileSync(path.join(__dirname, "fixtures", `${name}.json`), "utf8");

for (const [name, contentType] of Object.entries(providers)) {
  test(`parses the live ${name} fixture offline with numeric values`, async () => {
    const body = load(name);
    const fetcher = async () => ({
      status: 200,
      headers: { get: (h) => (h.toLowerCase() === "content-type" ? contentType : null) },
      text: async () => body,
    });
    const p = new SDMXParser();
    await p.getDatasets(`https://example.org/rest/data/${name}/all`, { fetcher });

    const data = p.getData();
    assert.ok(data.length > 0, "datasets non-empty");
    // Every value is a number; a provider's genuinely missing observation
    // (OBS_VALUE null, e.g. SBS) stays null and is never a string.
    for (const row of data) {
      if (row.value === null) continue;
      assert.equal(typeof row.value, "number", `${name}: ${JSON.stringify(row.value)} is not a number`);
      assert.ok(Number.isFinite(row.value));
    }
    assert.ok(data.some((row) => typeof row.value === "number"), "has numeric values");
    assert.ok(p.getDimensions().length > 0, "dimensions found");
    assert.ok(p.getActiveDimensions().length > 0, "active dimensions found");
  });
}

test("the BIS fixture carries numeric strings that getData coerces", () => {
  assert.match(load("bis"), /"observations":\{"0":\["\d/);
});
