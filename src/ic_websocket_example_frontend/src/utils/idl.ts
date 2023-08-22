import { IDL } from "@dfinity/candid";
import type { AppMessage } from "../../../declarations/ic_websocket_example_backend/ic_websocket_example_backend.did";

export const AppMessageIdl = IDL.Record({
  'text': IDL.Text,
  'timestamp': IDL.Nat64,
});

export const serializeAppMessage = (message: AppMessage): Uint8Array => {
  return new Uint8Array(IDL.encode([AppMessageIdl], [message]));
};

export const deserializeAppMessage = (bytes: Buffer | ArrayBuffer | Uint8Array): AppMessage => {
  return IDL.decode([AppMessageIdl], bytes)[0] as unknown as AppMessage;
};
