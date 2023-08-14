// returns the message latency in microseconds (us)
export const getMessageLatency = (message: { text: string; timestamp: number; }): bigint => {
  return getCurrentTimestamp() - getCanisterTimestamp(message.timestamp);
}

// returns the current timestamp in microseconds (us)
export const getCurrentTimestamp = (): bigint => {
  return BigInt(window.performance.timeOrigin + window.performance.now()) * (10n ** 3n);
}

// returns the canister timestamp in microseconds (us)
export const getCanisterTimestamp = (timestamp: bigint | number): bigint => {
  return BigInt(timestamp) / (10n ** 3n);
}
