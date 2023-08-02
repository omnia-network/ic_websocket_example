import "./styles.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import IcWebSocket from "ic-websocket-js";
import { addMessageToUI } from "./utils";
import { createActor } from "../../declarations/ic_websocket_example_backend";

// production
const gatewayUrl = "wss://gateway.icws.io";
const icUrl = "https://icp0.io";
// local test
// const gatewayUrl = "ws://127.0.0.1:8080";
// const icUrl = "http://127.0.0.1:4943";

const backendCanisterId = process.env.CANISTER_ID_IC_WEBSOCKET_EXAMPLE_BACKEND || "";
const localTest = true;
const persistKey = false;

const ic_websocket_example_backend = createActor(backendCanisterId, {
  agentOptions: {
    host: icUrl,
  }
});

let messageCount = 0;

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>IC WebSocket demo</h1>
    <div class="sub-header">
      <a href="https://github.com/omnia-network/ic_websocket_example" target="_blank">Source code</a>
    </div>
    <p class="subtitle">Open the browser DevTools to see more logs.</p>
    <div class="container">
      <div id="ws-status">
        <div id="ws-status-indicator" class="connecting"></div>
        <div id="ws-status-content">WebSocket is connecting...</div>
        <div id="ws-status-error"></div>
      </div>
      <div class="messages"></div>
      <div id="end-of-messages"></div>
    </div>
  </div>
`;

const ws = new IcWebSocket(gatewayUrl, undefined, {
  canisterId: backendCanisterId,
  canisterActor: ic_websocket_example_backend,
  networkUrl: icUrl,
  localTest,
  persistKey,
});

ws.onopen = () => {
  document.getElementById("ws-status-indicator")!.classList.remove("connecting");
  document.getElementById("ws-status-indicator")!.classList.add("connected");
  document.getElementById("ws-status-content")!.textContent = "WebSocket connected";
};

ws.onmessage = (event: MessageEvent<{ text: string; timestamp: number; }>) => {
  console.log("Received message:", event.data);
  addMessageToUI(event.data, 'backend');

  messageCount += 1;

  if (messageCount === 5) {
    ws.close();
    return;
  }

  setTimeout(async () => {
    console.log(messageCount);
    const newText = event.data.text + "-pong";
    event.data.text = newText;
    addMessageToUI(event.data, 'frontend');

    await ws.send({
      text: newText,
      timestamp: Date.now() * (10 ** 6),
    });

  }, 1000);
};

ws.onclose = () => {
  document.getElementById("ws-status-indicator")!.classList.remove("connected");
  document.getElementById("ws-status-indicator")!.classList.add("disconnected");
  document.getElementById("ws-status-content")!.innerHTML = `
    WebSocket closed
    <button id="ws-status-restart-button">Restart</button>
  `;

  document.getElementById("ws-status-restart-button")!.onclick = () => {
    window.location.reload();
  };
};

ws.onerror = (event) => {
  console.error(event);
  document.getElementById("ws-status-indicator")!.classList.remove("connected");
  document.getElementById("ws-status-indicator")!.classList.add("error");
  document.getElementById("ws-status-content")!.textContent = "WebSocket error";
  document.getElementById("ws-status-error")!.textContent = event.error.message;
};
