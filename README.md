# IC WebSocket example

This is a simple example of how to use IC WebSockets to send and receive messages between the frontend (browser) and the backend canister.

The example uses the IC WebSocket libraries:
- [ic-websocket-js](https://github.com/omnia-network/ic-websocket-sdk-js) for the frontend
- [ic-websocket-cdk](https://github.com/omnia-network/ic-websocket-cdk-rs) for the backend

The frontend connects to an IC WebSocket Gateway hosted on AWS under the [gateway.icws.io](wss://gateway.icws.io) domain and maintained by the [Omnia Network](https://github.com/omnia-network) team. To know more about how the IC WebSocket Gateway works, please refer to the [IC WebSocket Gateway](https://github.com/omnia-network/ic-websocket-gateway) repository.

If you want a step-by-step guide to implement WebSockets on the Internet Computer and build this example, see [WebSockets on the IC: Getting Started](https://medium.com/@ilbert/websockets-on-the-ic-getting-started-5f8bcdfaabdc).

## Demo

A **live demo** is available at [demo.icws.io](https://demo.icws.io).

## Understanding the example

### Frontend

The frontend canister is simple a [Vite](https://vitejs.dev/) app written in TypeScript. The relevant code to understand how to use the ic-websocket-js library is in the [main.ts](src/ic_websocket_example_frontend/src/main.ts) file.

### Backend

The backend canister is a [Rust canister](https://internetcomputer.org/docs/current/developer-docs/backend/rust). The relevant code to understand how to use the ic-websocket-cdk library is in the [lib.rs](src/ic_websocket_example_backend/src/lib.rs) file.

## Development

### Running the project locally

If you want to test your project locally, follow these preparation steps:
- make sure you are running an IC WebSocket Gateway locally. See the [IC WebSocket Gateway](https://github.com/omnia-network/ic-websocket-gateway) repository for more details.
- change the addresses of the local replica and the local IC WebSocket Gateway at the top of the [main.ts](src/ic_websocket_example_frontend/src/main.ts) file.

After completing the preparation steps, run the following commands:

```bash
# Starts the replica, running in the background
dfx start --background

# Deploys your canisters to the replica and generates your candid interface
dfx deploy
```

If you are making frontend changes, you can start a development server with

```bash
npm start
```

## License

Licensed under the [MIT License](./LICENSE).
