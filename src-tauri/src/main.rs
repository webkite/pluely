// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    println!("[DEBUG] Starting PocketCrew application (Version with Debug Logs)...");
    pocketcrew_lib::run()
}
