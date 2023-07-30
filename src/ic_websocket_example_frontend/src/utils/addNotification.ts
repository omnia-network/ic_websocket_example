import { capitalCase } from "change-case";

export default function addNotification(text: string, from: 'backend' | 'frontend', messageId?: string) {
  const currentDate = new Date();
  const formattedTime = new Intl.DateTimeFormat("default", {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false
  }).format(currentDate);

  const isLoading = from === 'frontend' && text === ''
  if (isLoading) {
    text = 'Sending pong...';
  }

  const newMessage = document.createElement("div");

  if (messageId) {
    const existingMessage = document.getElementById(messageId);
    if (existingMessage) {
      existingMessage.getElementsByClassName("message-text")[0].textContent = text;
      existingMessage.classList.remove("loading");

      return;
    }

    newMessage.id = messageId;
  }

  newMessage.classList.value = `message from-${from} ${isLoading ? 'loading' : ''}`;
  newMessage.innerHTML = `
    <span class="message-time">[${formattedTime}]: ${capitalCase(from)}</span>
    <span class="message-text">${text}</span>
  `;

  document.querySelector<HTMLDivElement>(".messages")!.appendChild(newMessage);

  // bring end-of-messages into view
  const endOfMessages = document.getElementById("end-of-messages")!;
  endOfMessages.scrollIntoView({ behavior: "smooth" });
}