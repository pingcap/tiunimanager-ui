# TiEM UI

## Scripts

```shell
# Clone
git clone https://github.com/pingcap-inc/tiem-ui
cd tiem-ui

# Install Dependencies
yarn

# Sync Swagger Spec
yarn api:sync # not supported yet because no fixed source at present

# Generate Glue Code for API
yarn api:gen

# Start Dev Server
yarn dev

# Start Dev Server with Mock
yarn dev:mock

# Start Dev Server with WDYR
yarn dev:wdyr

# Lint
yarn lint --fix

# Build
yarn build

# Preview in Production Mode
yarn build && yarn serve
```
