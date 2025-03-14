import "./styles.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import { IcWebSocket, generateRandomIdentity, createWsConfig } from "ic-websocket-js";
import { addMessageToUI } from "./utils";
import { ic_websocket_example_backend } from "../../declarations/ic_websocket_example_backend";
import type { AppMessage } from "../../declarations/ic_websocket_example_backend/ic_websocket_example_backend.did";

console.log("Version:", process.env.VERSION);

// production
const defaultGateways = [
  // gateway hosted by Omnia Team on AWS
  ["wss://gateway.icws.io", "wss://gateway.icws.io (AWS)"],
  // gateway hosted by Omnia Team on AWS
  ["wss://nix-gateway.icws.io", "wss://nix-gateway.icws.io (AWS - NixOS - experimental)"],
  // gateway hosted by Omnia Team on Akash
  ["wss://akash-gateway.icws.io", "wss://akash-gateway.icws.io (inactive)"],
];
const icUrl = "https://icp-api.io";
// local test
// const defaultGateways = [
//   ["ws://127.0.0.1:8080", "ws://127.0.0.1:8080 (local)"],
// ];
// const icUrl = "http://127.0.0.1:4943";

const queryParamGw = new URL(window.location.href).searchParams.get("gw");
const selectedGateway = queryParamGw
  ? (defaultGateways.find((gw) => gw[0] === queryParamGw) || [queryParamGw, `${queryParamGw} (custom)`])
  : defaultGateways[0];

const availableGateways = new Set([...defaultGateways, selectedGateway]);

const backendCanisterId = process.env.CANISTER_ID_IC_WEBSOCKET_EXAMPLE_BACKEND || "";

let messagesCount = 0;
let isClosed = false;
let isDemoEnded = false;

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    <h1>IC WebSocket demo</h1>
    <div class="sub-header">
      <a href="https://github.com/omnia-network/ic_websocket_example" target="_blank">Source code</a>
    </div>
    <p class="subtitle">Open the browser DevTools to see more logs.</p>
    <div class="gateway-selector-container">
      <label for="gateway-selector">Gateway:</label>
      <select id="gateway-selector">
        ${Array.from(availableGateways)
    .map((gateway) => `<option value="${gateway[0]}" ${gateway[0] === selectedGateway[0] ? 'selected' : ''}>${gateway[1]}</option>`)
    .join("")
  }
      </select>
    </div>
    <div class="ws-status-container">
      <div id="ws-status">
        <div id="ws-status-indicator" class="connecting"></div>
        <div id="ws-status-content">WebSocket is connecting...</div>
        <div id="ws-status-error"></div>
      </div>
    </div>
    <div class="messages-container">
      <div class="messages"></div>
      <div id="end-of-messages"></div>
    </div>
`;

const displayErrorMessage = (error: string) => {
  if (isClosed) {
    return;
  }

  document.getElementById("ws-status-indicator")!.classList.remove("connected");
  document.getElementById("ws-status-indicator")!.classList.add("error");
  document.getElementById("ws-status-content")!.textContent = "WebSocket error";
  document.getElementById("ws-status-error")!.textContent = error;
};

const wsConfig = createWsConfig({
  canisterId: backendCanisterId,
  canisterActor: ic_websocket_example_backend,
  identity: generateRandomIdentity(),
  networkUrl: icUrl,
});
const ws = new IcWebSocket(selectedGateway[0], undefined, wsConfig);

ws.onopen = () => {
  console.log("WebSocket state:", ws.readyState, "is open:", ws.readyState === ws.OPEN);

  document.getElementById("ws-status-indicator")!.classList.remove("connecting");
  document.getElementById("ws-status-indicator")!.classList.add("connected");
  document.getElementById("ws-status-content")!.innerHTML = `
    WebSocket opened
    <button id="ws-status-button">Close</button>
  `;

  document.getElementById("ws-status-button")!.onclick = () => {
    ws.close();
    isClosed = true;
  };
};

ws.onmessage = (event) => {
  if (isClosed) {
    return;
  }

  const message = event.data;

  console.log("Received message:", message);
  addMessageToUI(message, 'backend');

  messagesCount += 1;

  if (messagesCount === 50) {
    isDemoEnded = true;
    ws.close();
    console.log("Closing WebSocket after 50 ping-pongs. Reload the page to restart.");
    return;
  }

  setTimeout(async () => {
    if (isClosed) {
      return;
    }

    const messageToSend: AppMessage = {
      text: "pong",
      timestamp: BigInt(Date.now()),
    };
    addMessageToUI(messageToSend, 'frontend');

    try {
      ws.send(messageToSend);
    } catch (error) {
      if (isClosed) {
        return;
      }

      console.error("Error in onmessage callback:", error);

      displayErrorMessage(JSON.stringify(error));
    }
  }, 1000);
};

ws.onclose = () => {
  document.getElementById("ws-status-indicator")!.classList.remove("connected");
  document.getElementById("ws-status-indicator")!.classList.add("disconnected");
  document.getElementById("ws-status-content")!.innerHTML = `
    WebSocket closed ${isDemoEnded ? "(demo ended)" : ""}
    <button id="ws-status-button" class="outline">Restart</button>
  `;

  document.getElementById("ws-status-button")!.onclick = () => {
    window.location.reload();
  };
};

ws.onerror = (event) => {
  if (isClosed) {
    return;
  }

  const error = event.error.message;

  console.error("Error in onmessage callback:", error);

  displayErrorMessage(JSON.stringify(error));
};

document.getElementById("gateway-selector")!.onchange = () => {
  const newGw = (document.getElementById("gateway-selector")! as HTMLSelectElement).value;

  if (newGw === selectedGateway[0]) {
    return;
  }

  const newUrl = new URL(window.location.href);
  newUrl.searchParams.set("gw", newGw);

  window.location.href = newUrl.toString();
};
