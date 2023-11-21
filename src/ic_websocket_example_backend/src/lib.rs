use ic_cdk_macros::*;

use canister::{on_close, on_message, on_open, AppMessage};
use ic_websocket_cdk::{
    CanisterWsCloseArguments, CanisterWsCloseResult, CanisterWsGetMessagesArguments,
    CanisterWsGetMessagesResult, CanisterWsMessageArguments, CanisterWsMessageResult,
    CanisterWsOpenArguments, CanisterWsOpenResult, WsHandlers, WsInitParams,
};

mod canister;

/// This is the principal of the WS Gateway deployed on wss://gateway.icws.io
const GATEWAY_PRINCIPAL: &str =
    "3656s-3kqlj-dkm5d-oputg-ymybu-4gnuq-7aojd-w2fzw-5lfp2-4zhx3-4ae";

/// The principal of the WS Gateway deployed locally
// const GATEWAY_PRINCIPAL: &str =
//     "sqdfl-mr4km-2hfjy-gajqo-xqvh7-hf4mf-nra4i-3it6l-neaw4-soolw-tae";

#[init]
fn init() {
    let handlers = WsHandlers {
        on_open: Some(on_open),
        on_message: Some(on_message),
        on_close: Some(on_close),
    };

    let gateway_principals: Vec<String> = vec![
        String::from(GATEWAY_PRINCIPAL),
    ];

    let params = WsInitParams::new(handlers, gateway_principals);

    ic_websocket_cdk::init(params);
}

#[post_upgrade]
fn post_upgrade() {
    init();
}

// method called by the client to open a WS connection to the canister (relayed by the WS Gateway)
#[update]
fn ws_open(args: CanisterWsOpenArguments) -> CanisterWsOpenResult {
    ic_websocket_cdk::ws_open(args)
}

// method called by the Ws Gateway when closing the IcWebSocket connection for a client
#[update]
fn ws_close(args: CanisterWsCloseArguments) -> CanisterWsCloseResult {
    ic_websocket_cdk::ws_close(args)
}

// method called by the client to send a message to the canister (relayed by the WS Gateway)
#[update]
fn ws_message(args: CanisterWsMessageArguments, msg_type: Option<AppMessage>) -> CanisterWsMessageResult {
    ic_websocket_cdk::ws_message(args, msg_type)
}

// method called by the WS Gateway to get messages for all the clients it serves
#[query]
fn ws_get_messages(args: CanisterWsGetMessagesArguments) -> CanisterWsGetMessagesResult {
    ic_websocket_cdk::ws_get_messages(args)
}
