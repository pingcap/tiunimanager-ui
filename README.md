<p align="center">
  <br>
  <img src="./public/img/logo/common.svg" alt="logo" height="80px">
  <br>
  <br>
</p>

# TiUniManager UI

[![License](https://img.shields.io/badge/license-Apache--2.0-green?style=flat-square)](./LICENSE)

TiUniManager UI is a general purpose, web-based UI for [TiUniManager](https://github.com/pingcap/tiunimanager), a database operation and maintenance management platform for TiDB.

It allows users to view and manage TiDB clusters through the web-based UI.

Some of the features the TiUniManager UI supports:

- Cluster creation, deletion, scaling-out, cloning, upgrading etc...
- Realtime monitoring and alerting of cluster status
- Scheduled automatic and manual backups for cluster data
- Cluster data import and export
- Replicating change data to various downstreams
- Cluster parameters management

## Getting Started

First, you need to ensure that there is a local or remote TiUniManager server deployed via tiup-em available to provide services.

### Prerequisites

The followings are required for developing TiUniManager UI:

- [Git](https://git-scm.com/downloads)
- [Go 1.17+](https://go.dev/doc/install)
- [Node.js 16+](https://nodejs.org/)
- [Yarn 1.22+](https://classic.yarnpkg.com/en/docs/install)

### Getting the sources

```bash
# Clone our GitHub repository:
git clone https://github.com/pingcap/tiunimanager-ui

# Go to the tiunimanager-ui directory:
cd tiunimanager-ui
```

### Installing dependencies

```bash
# Install project dependencies (package.json)
yarn install

# Bootstrap tools
yarn bootstrap
```

### Generate external codes

Next, generate remote request modules and error message translation files.

```bash
yarn generate
```

### Configure environment variables

If your TiUniManager server is running locally and is deployed using the default configuration, you can skip this section.

Otherwise, you need to finish the following steps.

1. Create a `.env.local` file in the root directory of the project.
2. Paste the following contents into the `.env.local` file.

```ini
# Replace {xxxx-host} with the real host of the services
# for your TiUniManager server.
# See the TiUniManager topology config.yaml for more details.
# config.yaml is located in the /home/tidb directory of the machine
# running your TiUniManager server.

# System external services
VITE_MONITOR_URL="http://{grafana-host}/d/em000001/em-server?orgId=1&refresh=10s&kiosk=tv"
VITE_LOG_URL="http://{kibana-host}/app/discover"
VITE_ALERT_URL="http://{alertmanager-host}"
VITE_TRACER_URL="http://{tracer-host}"

# Dev server proxy
VITE_PROXY_WEB_TARGET="http://{web-srv-host}"
VITE_PROXY_API_TARGET="http://{api-srv-host}"
VITE_PROXY_FS_TARGET="http://{file-srv-host}"
```

### Build and run

Now, run the following command to start a development server.

```bash
yarn dev
```

That's it! You can access TiUniManager UI through http://127.0.0.1:3000.

## Browser support

TiUniManager UI has been tested on modern evergreen browsers.

It generally supports:

- Google Chrome 79+ (Windows, macOS, Linux)
- Mozilla Firefox 72+ (Windows, macOS, Linux)
- Apple Safari 14+ (macOS)
- Microsoft Edge 79+ (Windows)

## Need help?

Please use [Github Discussions](https://github.com/pingcap/tiunimanager-ui/discussions) for help requests and how-to questions.

Please open GitHub issues for bugs only, not general help requests. You can search previous issues before creating a new issue.

## Interested in contributing?

Read through our [contributing guidelines](./CONTRIBUTING.md) to learn about our submission process and more.

If you want to contribute through code, read the [development guide](./doc/development.md) to learn about our development process, and how to build your changes to TiUniManager UI.

## License

Copyright 2022 PingCAP. All rights reserved.

Licensed under the [Apache 2.0 License](./LICENSE).
