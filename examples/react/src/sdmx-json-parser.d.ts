declare module 'sdmx-json-parser' {
  export class SDMXParser {
    constructor();
    getDatasets(url: string): Promise<void>;
    getData(): [];
  }
}
