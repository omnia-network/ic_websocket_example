use ic_cdk::{export::candid::CandidType, print, api::time};
use ic_cdk_macros::*;
use serde::{Deserialize, Serialize};
use serde_cbor::from_slice;
use std::{cell::RefCell, time::Duration};
use ic_cdk_timers::TimerId;

use ic_websocket_cdk::{
    ws_send, ClientPublicKey, OnCloseCallbackArgs, OnMessageCallbackArgs, OnOpenCallbackArgs,
};

#[derive(CandidType, Clone, Debug, Deserialize, Serialize, Eq, PartialEq)]
#[candid_path("ic_cdk::export::candid")]
pub struct AppMessage {
    pub text: String,
    pub timestamp: u64,
}

thread_local! {
    /* flexible */ static CONNECTED_CLIENT_KEY: RefCell<ClientPublicKey> = RefCell::default();
    /* flexible */ static TIMER_ID: RefCell<TimerId> = RefCell::default();
    /* flexible */ static IS_TIMER_RUNNING: RefCell<bool> = RefCell::new(false);
}

pub fn on_open(args: OnOpenCallbackArgs) {
    CONNECTED_CLIENT_KEY.with(|client_key| {
        *client_key.borrow_mut() = args.client_key;
    });
}

pub fn on_message(args: OnMessageCallbackArgs) {
    let app_msg: AppMessage = from_slice(&args.message).unwrap();
    print(format!("Received message: {:?}", app_msg));
}

pub fn on_close(args: OnCloseCallbackArgs) {
    print(format!("Client {:?} disconnected", args.client_key));
    CONNECTED_CLIENT_KEY.with(|client_key| {
        *client_key.borrow_mut() = vec![];
    });
}

#[update]
fn start_timer(interval_ms: u64) {
    TIMER_ID.with(|timer_id| {
        let mut timer_id = timer_id.borrow_mut();
        *timer_id = ic_cdk_timers::set_timer_interval(Duration::from_millis(interval_ms), || {
            print(format!("Timer fired at {}", time()));
            let msg = AppMessage {
                text: String::from("ping"),
                timestamp: time(),
            };

            CONNECTED_CLIENT_KEY.with(|client_key| {
                let client_key = client_key.borrow();
                if let Err(e) = ws_send(client_key.clone(), msg) {
                    print(format!("Could not send message: {}", e));
                }
            });
        });
    });
    IS_TIMER_RUNNING.with(|is_timer_running| *is_timer_running.borrow_mut() = true);
    print("Timer started");
}

#[update]
fn stop_timer() {
    TIMER_ID.with(|timer_id| {
        let mut timer_id = timer_id.borrow_mut();
        ic_cdk_timers::clear_timer(*timer_id);
        *timer_id = TimerId::default();
    });
    IS_TIMER_RUNNING.with(|is_timer_running| *is_timer_running.borrow_mut() = false);
    print("Timer stopped");
}

#[query]
fn is_timer_running() -> bool {
    IS_TIMER_RUNNING.with(|is_timer_running| *is_timer_running.borrow())
}
