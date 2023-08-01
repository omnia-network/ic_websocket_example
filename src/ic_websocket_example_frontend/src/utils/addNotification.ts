import { capitalCase } from "change-case";

export default function addMessageToUI(message: { text: string; timestamp: number; }, from: 'backend' | 'frontend', messageId?: string) {
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
    const latencyMs = Date.now() - (message.timestamp / (10 ** 6));

    latencySpan = `
    <span class="message-latency">(latency: ${Math.floor(latencyMs)}ms)</span>
    `;
  }

  const iconName = from === 'backend' ? 'arrow-right' : 'arrow-left';

  newMessage.classList.value = `message from-${from} ${isLoading ? 'loading' : ''}`;
  newMessage.innerHTML = `
  <span class="message-before">
    <span><i class="bi-${iconName}"></i>${capitalCase(from)}</span>
    ${latencySpan}
  </span>
  <span class="message-content">${message.text}</span>
  `;

  document.querySelector<HTMLDivElement>(".messages")!.appendChild(newMessage);

  // bring end-of-messages into view
  const endOfMessages = document.getElementById("end-of-messages")!;
  endOfMessages.scrollIntoView({ behavior: "smooth" });
}