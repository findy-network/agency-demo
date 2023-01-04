![Screenshot](https://github.com/findy-network/agency-demo/blob/master/client/public/seo-logo.jpg?raw=true)

<h1 align="center"><b>Findy Agency Self-Sovereign Identity Demo</b></h1>
<div align="center">
  
[![Continuous Deployment](https://github.com/findy-network/agency-demo/actions/workflows/test.yml/badge.svg)](https://github.com/findy-network/agency-demo/actions/workflows/test.yml)
    <a
    href="https://raw.githubusercontent.com/findy-network/agency-demo/master/LICENSE"
    ><img
      alt="License"
      src="https://img.shields.io/badge/License-Apache%202.0-blue.svg"
  /></a>
  [![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)
 
</div>

## ✨ Hi there!

Welcome to the repository of Findy Agency's Self-Sovereign identity demo. This interactive app
demonstrates the use of verifiable credentials. This demo is built using [Findy Agency](https://findy-network.github.io).
Findy Agency is a multitenant SSI agency. This demo is based on [Animo's](<(https://animo.id)>)
similar demo for Aries Javascript Framework functionality.

## 🛠️ Usage

### Prerequisites

- [NodeJS](https://nodejs.org/en/) v16.X.X - Other versions may work, not tested
- [Yarn](https://classic.yarnpkg.com/en/docs/install)
- [Git](https://git-scm.com/downloads) - You probably already have this

### 🖥 Client

Copy the `.env.example` file to a `.env` file and set the environment variables.

```bash
cd client
cp .env.example .env
```

| Variable                   | Description                                                                                                                                   |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `REACT_APP_HOST_BACKEND`   | Used in the frontend application to connect with the backend. Should be `http://localhost:5000` for development.                              |
| `REACT_APP_HOST_WEBSOCKET` | Used in the frontend application to connect with the WebSocket server and listen for events. Should be `ws://localhost:5000` for development. |

### 🎛️ Server

Copy the `.env.example` file to a `.env` file and set the environment variables.

```bash
cd server
cp .env.example .env
```

| Variable                 | Description                |
| ------------------------ | -------------------------- |
| `AGENCY_AUTH_URL`        | Agency auth service URL    |
| `AGENCY_AUTH_ORIGIN`     | Agency auth service origin |
| `AGENCY_USER_NAME`       | Agent user name            |
| `AGENCY_PUBLIC_DID_SEED` | Agent public DID seed      |
| `AGENCY_KEY`             | Agent authenticator key    |
| `SERVER_ADDRESS`         | Agency gRPC server address |
| `SERVER_PORT`            | Agency gRPC server port    |
| `WALLET_URL`             | Agency web wallet URL      |

### Node version

```bash
nvm use
```

### Install Dependencies

```bash
yarn install
```

### Development

```bash
yarn dev
```
