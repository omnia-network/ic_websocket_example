import "./styles.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import IcWebSocket, { generateRandomIdentity, createWsConfig } from "ic-websocket-js";
import { addMessageToUI } from "./utils";
import { ic_websocket_example_backend } from "../../declarations/ic_websocket_example_backend";
import type { AppMessage, _SERVICE } from "../../declarations/ic_websocket_example_backend/ic_websocket_example_backend.did";

// production
const gatewayUrl = "wss://gateway.icws.io";
const icUrl = "https://icp0.io";
// local test
// const gatewayUrl = "ws://127.0.0.1:8080";
// const icUrl = "http://127.0.0.1:4943";

const backendCanisterId = process.env.CANISTER_ID_IC_WEBSOCKET_EXAMPLE_BACKEND || "";

let messagesCount = 0;
let isClosed = false;

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    <h1>IC WebSocket demo</h1>
    <div class="sub-header">
      <a href="https://github.com/omnia-network/ic_websocket_example" target="_blank">Source code</a>
    </div>
    <p class="subtitle">Open the browser DevTools to see more logs.</p>
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

const initParams = createWsConfig({
  canisterId: backendCanisterId,
  canisterActor: ic_websocket_example_backend,
  identity: generateRandomIdentity(),
  networkUrl: icUrl,
});

const ws = new IcWebSocket(gatewayUrl, undefined, initParams);

const displayErrorMessage = (error: string) => {
  if (isClosed) {
    return;
  }

  console.error(error);
  document.getElementById("ws-status-indicator")!.classList.remove("connected");
  document.getElementById("ws-status-indicator")!.classList.add("error");
  document.getElementById("ws-status-content")!.textContent = "WebSocket error";
  document.getElementById("ws-status-error")!.textContent = error;
};

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
    addMessageToUI(message, 'frontend');

    try {
      ws.send(messageToSend);
    } catch (error) {
      if (isClosed) {
        return;
      }

      displayErrorMessage(JSON.stringify(error));
    }
  }, 1000);
};

ws.onclose = () => {
  document.getElementById("ws-status-indicator")!.classList.remove("connected");
  document.getElementById("ws-status-indicator")!.classList.add("disconnected");
  document.getElementById("ws-status-content")!.innerHTML = `
    WebSocket closed
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

  displayErrorMessage(event.error.message);
}
