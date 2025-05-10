use candid::{decode_one, encode_one, CandidType};
use ic_cdk::api::time;
use serde::{Deserialize, Serialize};

use ic_websocket_cdk::{
    send, ClientPrincipal, OnCloseCallbackArgs, OnMessageCallbackArgs, OnOpenCallbackArgs,
};

#[derive(CandidType, Clone, Debug, Deserialize, Serialize, Eq, PartialEq)]
pub struct AppMessage {
    pub text: String,
    pub timestamp: u64,
}

impl AppMessage {
    fn candid_serialize(&self) -> Vec<u8> {
        encode_one(&self).unwrap()
    }
}

pub fn on_open(args: OnOpenCallbackArgs) {
    let msg = AppMessage {
        text: String::from("ping"),
        timestamp: time(),
    };
    send_app_message(args.client_principal, msg);
}

pub fn on_message(args: OnMessageCallbackArgs) {
    let app_msg: AppMessage = decode_one(&args.message).unwrap();
    let new_msg = AppMessage {
        text: String::from("ping"),
        timestamp: time(),
    };
    ic_cdk::println!("Received message: {:?}", app_msg);
    send_app_message(args.client_principal, new_msg)
}

fn send_app_message(client_principal: ClientPrincipal, msg: AppMessage) {
    ic_cdk::println!("Sending message: {:?}", msg);
    if let Err(e) = send(client_principal, msg.candid_serialize()) {
        println!("Could not send message: {}", e);
    }
}

pub fn on_close(args: OnCloseCallbackArgs) {
    ic_cdk::println!("Client {} disconnected", args.client_principal);
}
