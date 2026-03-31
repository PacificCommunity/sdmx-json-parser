Documentation on how we can use SDMXParser in vanilla js

Usage

SDMX-JSON-parser provides a set of utility function to parse a SDMX-JSON message and extract data arrays.

```javascript

/*
    To use packages node_modules needed
*/
    npm install

/*
    once node_modules folder is available we need to start the server. make sure to use node version above 14 
*/

    npm run server
/*
once you import the parser create a object.
*/

const parser = new SDMXParser();
/*
after creating a object provide api to getDataset function
*/

await parser.getDatasets(api);
/*
once data set is loaded we can use getData function for getting parser data.
we have other functions for getData, name, dimensions, attributes, observations and so on...
*/
```
