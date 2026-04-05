// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
// Copyright (c) 2026 Atomicode® — Monitor Xpress

use serde::{Deserialize, Serialize};
use sysinfo::{CpuRefreshKind, Disks, MemoryRefreshKind, Networks, RefreshKind, System};
use std::sync::{Arc, Mutex};
use std::process::Command;
use tauri::State;

use nvml_wrapper::Nvml;

// Estado global
struct AppState {
    system: Mutex<System>,
    networks: Mutex<Networks>,
    disks: Mutex<Disks>,
    prev_net: Mutex<(u64, u64)>,
    nvml: Option<Nvml>,
    // Los sensores se actualizan en un hilo background, nunca bloquean la UI
    sensors_data: Arc<Mutex<SensorsInfo>>,
}

// === STRUCTS ===

#[derive(Serialize, Clone)]
struct CpuCore { name: String, usage: f32, frequency: u64 }

#[derive(Serialize, Clone)]
struct CpuInfo {
    name: String, physical_cores: usize, logical_cores: usize,
    global_usage: f32, frequency: u64, cores: Vec<CpuCore>, temperature: f32,
}

#[derive(Serialize, Clone)]
struct RamInfo {
    total: u64, used: u64, available: u64, usage_percent: f32,
    swap_total: u64, swap_used: u64,
}

#[derive(Serialize, Clone)]
struct GpuInfo {
    available: bool, name: String, temperature: u32, usage: u32,
    memory_used: u64, memory_total: u64, memory_percent: f32,
    fan_speed: u32, power_usage: f32, power_limit: f32,
    clock_graphics: u32, clock_memory: u32,
}

#[derive(Serialize, Clone)]
struct DiskInfo {
    name: String, mount_point: String, fs_type: String,
    total: u64, used: u64, available: u64, usage_percent: f32, is_removable: bool,
}

#[derive(Serialize, Clone)]
struct NetworkInfo {
    download_speed: u64, upload_speed: u64,
    total_received: u64, total_transmitted: u64,
    interfaces: Vec<NetInterface>,
}

#[derive(Serialize, Clone)]
struct NetInterface { name: String, received: u64, transmitted: u64 }

#[derive(Serialize, Deserialize, Clone)]
struct SensorReading {
    name: String, sensor_type: String, value: f32, unit: String,
}

#[derive(Serialize, Deserialize, Clone)]
struct SensorsInfo { cpu_temp: f32, sensors: Vec<SensorReading>, source: String }

#[derive(Serialize)]
struct SystemInfo {
    cpu: CpuInfo, ram: RamInfo, gpu: GpuInfo,
    disks: Vec<DiskInfo>, network: NetworkInfo, sensors: SensorsInfo,
}

// === Respuesta del script PowerShell ===
#[derive(Deserialize)]
struct PsResult { sensors: Vec<SensorReading>, cpu_temp: f32, error: String }

// === Buscar script de sensores ===
fn find_sensor_script() -> Option<String> {
    let dev_path = std::path::PathBuf::from("resources/lhm/read_sensors.ps1");
    if dev_path.exists() {
        return Some(std::fs::canonicalize(dev_path).unwrap().to_string_lossy().to_string());
    }
    if let Ok(exe_path) = std::env::current_exe() {
        if let Some(exe_dir) = exe_path.parent() {
            let prod_path = exe_dir.join("lhm").join("read_sensors.ps1");
            if prod_path.exists() {
                return Some(prod_path.to_string_lossy().to_string());
            }
        }
    }
    None
}

// === Leer sensores via PowerShell (llamado SOLO desde hilo background) ===
fn read_sensors_ps(script_path: &str) -> SensorsInfo {
    let empty = SensorsInfo { cpu_temp: 0.0, sensors: Vec::new(), source: "none".to_string() };

    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;

        let output = Command::new("powershell")
            .args(["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File", script_path])
            .creation_flags(CREATE_NO_WINDOW)
            .output();

        match output {
            Ok(out) => {
                let stdout = String::from_utf8_lossy(&out.stdout);
                match serde_json::from_str::<PsResult>(&stdout) {
                    Ok(result) => {
                        if !result.error.is_empty() { return empty; }
                        SensorsInfo {
                            cpu_temp: result.cpu_temp,
                            sensors: result.sensors,
                            source: "lhm-direct".to_string(),
                        }
                    }
                    Err(_) => empty,
                }
            }
            Err(_) => empty,
        }
    }
    #[cfg(not(target_os = "windows"))]
    { empty }
}

// === Hilo background para sensores ===
fn start_sensor_thread(script_path: String, sensors_data: Arc<Mutex<SensorsInfo>>) {
    std::thread::spawn(move || {
        println!("Hilo de sensores iniciado");
        loop {
            let data = read_sensors_ps(&script_path);
            if let Ok(mut cache) = sensors_data.lock() {
                *cache = data;
            }
            // Leer cada 5 segundos (no bloquea la UI)
            std::thread::sleep(std::time::Duration::from_secs(5));
        }
    });
}

// === Leer GPU NVIDIA ===
fn read_gpu(nvml: &Option<Nvml>) -> GpuInfo {
    let default = GpuInfo {
        available: false, name: "No detectada".to_string(),
        temperature: 0, usage: 0, memory_used: 0, memory_total: 0,
        memory_percent: 0.0, fan_speed: 0, power_usage: 0.0, power_limit: 0.0,
        clock_graphics: 0, clock_memory: 0,
    };

    let nvml = match nvml { Some(n) => n, None => return default };
    let device = match nvml.device_by_index(0) { Ok(d) => d, Err(_) => return default };

    let name = device.name().unwrap_or_else(|_| "NVIDIA GPU".to_string());
    let temperature = device.temperature(nvml_wrapper::enum_wrappers::device::TemperatureSensor::Gpu).unwrap_or(0);
    let (usage, _) = match device.utilization_rates() { Ok(u) => (u.gpu, u.memory), Err(_) => (0, 0) };
    let (memory_used, memory_total) = match device.memory_info() { Ok(m) => (m.used, m.total), Err(_) => (0, 0) };
    let memory_percent = if memory_total > 0 { (memory_used as f64 / memory_total as f64 * 100.0) as f32 } else { 0.0 };
    let fan_speed = device.fan_speed(0).unwrap_or(0);
    let power_usage = device.power_usage().unwrap_or(0) as f32 / 1000.0;
    let power_limit = match device.enforced_power_limit() {
        Ok(p) => p as f32 / 1000.0,
        Err(_) => device.power_management_limit().unwrap_or(0) as f32 / 1000.0,
    };
    let clock_graphics = device.clock_info(nvml_wrapper::enum_wrappers::device::Clock::Graphics).unwrap_or(0);
    let clock_memory = device.clock_info(nvml_wrapper::enum_wrappers::device::Clock::Memory).unwrap_or(0);

    GpuInfo {
        available: true, name, temperature, usage,
        memory_used, memory_total, memory_percent, fan_speed,
        power_usage, power_limit, clock_graphics, clock_memory,
    }
}

// === COMANDO TAURI (nunca bloquea — lee del cache) ===

#[tauri::command]
fn get_system_info(state: State<AppState>) -> SystemInfo {
    let mut sys = state.system.lock().unwrap();
    let mut networks = state.networks.lock().unwrap();
    let mut disks = state.disks.lock().unwrap();
    let mut prev_net = state.prev_net.lock().unwrap();

    sys.refresh_cpu_usage();
    sys.refresh_memory();
    networks.refresh(true);
    disks.refresh(true);

    // Sensores: solo leer del cache (no bloquea)
    let sensors = state.sensors_data.lock().unwrap().clone();

    // CPU
    let cpus = sys.cpus();
    let cpu_name = if !cpus.is_empty() { cpus[0].brand().to_string() } else { "Desconocido".to_string() };
    let cores: Vec<CpuCore> = cpus.iter().enumerate()
        .map(|(i, cpu)| CpuCore { name: format!("Core {}", i), usage: cpu.cpu_usage(), frequency: cpu.frequency() })
        .collect();
    let global_usage = if !cores.is_empty() { cores.iter().map(|c| c.usage).sum::<f32>() / cores.len() as f32 } else { 0.0 };
    let frequency = if !cpus.is_empty() { cpus[0].frequency() } else { 0 };
    let physical_cores = System::physical_core_count().unwrap_or(0);

    let cpu = CpuInfo {
        name: cpu_name, physical_cores, logical_cores: cpus.len(),
        global_usage, frequency, cores, temperature: sensors.cpu_temp,
    };

    // RAM
    let ram = RamInfo {
        total: sys.total_memory(), used: sys.used_memory(), available: sys.available_memory(),
        usage_percent: if sys.total_memory() > 0 { (sys.used_memory() as f64 / sys.total_memory() as f64 * 100.0) as f32 } else { 0.0 },
        swap_total: sys.total_swap(), swap_used: sys.used_swap(),
    };

    let gpu = read_gpu(&state.nvml);

    // Discos
    let disk_list: Vec<DiskInfo> = disks.iter().map(|d| {
        let total = d.total_space();
        let available = d.available_space();
        let used = total.saturating_sub(available);
        DiskInfo {
            name: d.name().to_string_lossy().to_string(),
            mount_point: d.mount_point().to_string_lossy().to_string(),
            fs_type: d.file_system().to_string_lossy().to_string(),
            total, used, available,
            usage_percent: if total > 0 { (used as f64 / total as f64 * 100.0) as f32 } else { 0.0 },
            is_removable: d.is_removable(),
        }
    }).collect();

    // Red
    let mut total_rx: u64 = 0;
    let mut total_tx: u64 = 0;
    let mut interfaces: Vec<NetInterface> = Vec::new();
    for (name, data) in networks.iter() {
        let rx = data.total_received();
        let tx = data.total_transmitted();
        total_rx += rx;
        total_tx += tx;
        if rx > 0 || tx > 0 {
            interfaces.push(NetInterface { name: name.clone(), received: rx, transmitted: tx });
        }
    }
    let (prev_rx, prev_tx) = *prev_net;
    let download_speed = if prev_rx > 0 { total_rx.saturating_sub(prev_rx) } else { 0 };
    let upload_speed = if prev_tx > 0 { total_tx.saturating_sub(prev_tx) } else { 0 };
    *prev_net = (total_rx, total_tx);

    let network = NetworkInfo {
        download_speed, upload_speed,
        total_received: total_rx, total_transmitted: total_tx, interfaces,
    };

    SystemInfo { cpu, ram, gpu, disks: disk_list, network, sensors }
}

#[tauri::command]
fn exit_app() {
    std::process::exit(0);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let sys = System::new_with_specifics(
        RefreshKind::nothing()
            .with_cpu(CpuRefreshKind::everything())
            .with_memory(MemoryRefreshKind::everything()),
    );
    let networks = Networks::new_with_refreshed_list();
    let disks = Disks::new_with_refreshed_list();

    let nvml = Nvml::init().ok();
    if nvml.is_some() { println!("NVML inicializado - GPU NVIDIA detectada"); }

    // Sensores en hilo background
    let sensors_data = Arc::new(Mutex::new(SensorsInfo {
        cpu_temp: 0.0, sensors: Vec::new(), source: "none".to_string(),
    }));

    if let Some(script_path) = find_sensor_script() {
        println!("Script de sensores: {}", script_path);
        start_sensor_thread(script_path, sensors_data.clone());
    } else {
        println!("Script de sensores no encontrado");
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(AppState {
            system: Mutex::new(sys),
            networks: Mutex::new(networks),
            disks: Mutex::new(disks),
            prev_net: Mutex::new((0, 0)),
            nvml,
            sensors_data,
        })
        .invoke_handler(tauri::generate_handler![get_system_info, exit_app])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
