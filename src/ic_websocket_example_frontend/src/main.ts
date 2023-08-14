import "./styles.css";

import IcWebSocket from "ic-websocket-js";
import { getCanisterTimestamp, getCurrentTimestamp, getMessageLatency } from "./utils";
import { createActor } from "../../declarations/ic_websocket_example_timer_backend";

// production
const gatewayUrl = "wss://gateway.icws.io";
const icUrl = "https://icp0.io";
// local test
// const gatewayUrl = "ws://127.0.0.1:8080";
// const icUrl = "http://127.0.0.1:4943";

const backendCanisterId = process.env.CANISTER_ID_IC_WEBSOCKET_EXAMPLE_TIMER_BACKEND || "";
const localTest = true;
const persistKey = false;

const ic_websocket_example_backend = createActor(backendCanisterId, {
  agentOptions: {
    host: icUrl,
  }
});

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    <h1>IC WebSocket demo</h1>
    <p class="subtitle">Open the browser DevTools to see more logs.</p>
`;

const ws = new IcWebSocket(gatewayUrl, undefined, {
  canisterId: backendCanisterId,
  canisterActor: ic_websocket_example_backend,
  networkUrl: icUrl,
  localTest,
  persistKey,
});

ws.onopen = () => {
  console.log("ws open");
};

ws.onmessage = (event: MessageEvent<{ text: string; timestamp: number; }>) => {
  const canisterTimestamp = getCanisterTimestamp(event.data.timestamp);
  console.log("ws message", event.data, "canister timestamp (us)", canisterTimestamp, canisterTimestamp.toString());
  const latency = getMessageLatency(event.data);
  console.log("ws message latency (us)", latency, latency.toString());
  const currentTimestamp = getCurrentTimestamp();
  console.log("ws message current timestamp (us)", currentTimestamp, currentTimestamp.toString());
};

ws.onclose = () => {
  console.log("ws closed");
};

ws.onerror = (event) => {
  console.log("ws error", event.error);
}
