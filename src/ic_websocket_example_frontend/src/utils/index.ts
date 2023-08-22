import { capitalCase } from "change-case";
import type { AppMessage } from "../../../declarations/ic_websocket_example_backend/ic_websocket_example_backend.did";

// returns the message latency in microseconds (us)
const getMessageLatency = (message: AppMessage) => {
  return Number((BigInt(Date.now()) * (10n ** 3n)) - (BigInt(message.timestamp) / (10n ** 3n)));
}

export const addMessageToUI = (message: AppMessage, from: 'backend' | 'frontend', messageId?: string) => {
  const isLoading = from === 'frontend' && message.text === ''
  if (isLoading) {
    message.text = 'Sending pong...';
  }

  const newMessage = document.createElement("div");

  if (messageId) {
    const existingMessage = document.getElementById(messageId);
    if (existingMessage) {
      existingMessage.getElementsByClassName("message-text")[0].textContent = message.text;
      existingMessage.classList.remove("loading");

      return;
    }

    newMessage.id = messageId;
  }

  let latencySpan = '';

  if (from === 'backend') {
    const latencyUs = getMessageLatency(message);
    const displayLatency = `(latency: ${Math.floor(latencyUs/1_000)}ms)`;
    console.log("current timestamp (ms)", Date.now(), "canister-->client latency (us):", latencyUs);

    latencySpan = `<span class="message-latency">${displayLatency}</span>`;
  }

  const iconName = from === 'backend' ? 'arrow-down' : 'arrow-up';

  newMessage.classList.value = `message from-${from} ${isLoading ? 'loading' : ''}`;
  newMessage.innerHTML = `
  <span class="message-before">
    <span><i class="bi-${iconName}"></i>${capitalCase(from)}</span>
  </span>
  <span class="message-content">${message.text}</span>
  ${latencySpan}
  `;

  document.querySelector<HTMLDivElement>(".messages")!.appendChild(newMessage);

  // bring end-of-messages into view
  const endOfMessages = document.getElementById("end-of-messages")!;
  endOfMessages.scrollIntoView({ behavior: "smooth" });
}
