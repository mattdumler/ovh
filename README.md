# OVH: JavaScript API Client

A JavaScript client wrapping the OVH API.

## Usage

``` js
import OVH from "https://github.com/mattdumler/ovh/blob/main/mod.js";

const app = {
  key: "<ovh-app-key>",
  secret: "<ovh-app-secret>"
};

const ovh = new OVH(app);
```

## Documentation

The definitive JavaScript documentation tool, `jsdoc`, generates this project's documentation.

``` bash
jsdoc --readme README.md --destination docs --recurse .
```

On macOS, the `entre` command can be utilized to live build the docs when you save a change.

``` bash
ls README.md *.js | entr jsdoc --readme README.md --destination docs --recurse .
```

