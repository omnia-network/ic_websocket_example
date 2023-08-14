use ic_cdk_macros::*;
use std::{cell::RefCell, time::Duration};
use ic_cdk_timers::TimerId;

use canister::{on_close, on_message, on_open};
use ic_websocket_cdk::{
    CanisterWsCloseArguments, CanisterWsCloseResult, CanisterWsGetMessagesArguments,
    CanisterWsGetMessagesResult, CanisterWsMessageArguments, CanisterWsMessageResult,
    CanisterWsOpenArguments, CanisterWsOpenResult, CanisterWsRegisterArguments,
    CanisterWsRegisterResult, WsHandlers,
};

mod canister;

/// This is the principal of the WS Gateway deployed on wss://icws.io
// pub const GATEWAY_PRINCIPAL: &str =
//     "3656s-3kqlj-dkm5d-oputg-ymybu-4gnuq-7aojd-w2fzw-5lfp2-4zhx3-4ae";
pub const GATEWAY_PRINCIPAL: &str =
    "sqdfl-mr4km-2hfjy-gajqo-xqvh7-hf4mf-nra4i-3it6l-neaw4-soolw-tae";
    
thread_local! {
    /* flexible */ static TIMER_ID: RefCell<TimerId> = RefCell::default();
    /* flexible */ static IS_TIMER_RUNNING: RefCell<bool> = RefCell::new(false);
}

#[init]
fn init() {
    let handlers = WsHandlers {
        on_open: Some(on_open),
        on_message: Some(on_message),
        on_close: Some(on_close),
    };

    ic_websocket_cdk::init(handlers, GATEWAY_PRINCIPAL);
}

#[post_upgrade]
fn post_upgrade() {
    let handlers = WsHandlers {
        on_open: Some(on_open),
        on_message: Some(on_message),
        on_close: Some(on_close),
    };

    ic_websocket_cdk::init(handlers, GATEWAY_PRINCIPAL);
}

// method called by the client SDK when instantiating a new IcWebSocket
#[update]
fn ws_register(args: CanisterWsRegisterArguments) -> CanisterWsRegisterResult {
    ic_websocket_cdk::ws_register(args)
}

// method called by the WS Gateway after receiving FirstMessage from the client
#[update]
fn ws_open(args: CanisterWsOpenArguments) -> CanisterWsOpenResult {
    ic_websocket_cdk::ws_open(args)
}

// method called by the Ws Gateway when closing the IcWebSocket connection
#[update]
fn ws_close(args: CanisterWsCloseArguments) -> CanisterWsCloseResult {
    ic_websocket_cdk::ws_close(args)
}

// method called by the WS Gateway to send a message of type GatewayMessage to the canister
#[update]
fn ws_message(args: CanisterWsMessageArguments) -> CanisterWsMessageResult {
    ic_websocket_cdk::ws_message(args)
}

// method called by the WS Gateway to get messages for all the clients it serves
#[query]
fn ws_get_messages(args: CanisterWsGetMessagesArguments) -> CanisterWsGetMessagesResult {
    ic_websocket_cdk::ws_get_messages(args)
}

#[update]
fn start_timer(interval_ms: u64) {
    TIMER_ID.with(|timer_id| {
        let mut timer_id = timer_id.borrow_mut();
        *timer_id = ic_cdk_timers::set_timer_interval(Duration::from_millis(interval_ms), || {
            ic_cdk::print("Hello from timer!");
        });
    });
    IS_TIMER_RUNNING.with(|is_timer_running| *is_timer_running.borrow_mut() = true);
}

#[update]
fn stop_timer() {
    TIMER_ID.with(|timer_id| {
        let mut timer_id = timer_id.borrow_mut();
        ic_cdk_timers::clear_timer(*timer_id);
        *timer_id = TimerId::default();
    });
    IS_TIMER_RUNNING.with(|is_timer_running| *is_timer_running.borrow_mut() = false);
}

#[query]
fn is_timer_running() -> bool {
    IS_TIMER_RUNNING.with(|is_timer_running| *is_timer_running.borrow())
}
