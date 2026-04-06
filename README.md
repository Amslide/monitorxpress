# Monitor Xpress

Aplicación de escritorio para monitorización de hardware en tiempo real. Visualiza el rendimiento de tu PC con una interfaz moderna, ligera y sin telemetría.

Desarrollado por [Atomicode®](https://www.atomicode.net)

## Características
- **CPU** — Uso global, temperatura, frecuencia, uso por núcleo
- **RAM** — Usada, disponible, total, swap
- **GPU** — Uso, temperatura, ventilador, VRAM, consumo, clocks (NVIDIA)
- **Discos** — Espacio usado/libre, temperaturas
- **Ventiladores** — RPM de todos los ventiladores del sistema
- **Placa Base** — Temperaturas, voltajes, otros sensores
- **Red** — Velocidad de descarga/subida en tiempo real, interfaces

## Interfaz
- Diseño glassmorphism con tema oscuro y claro
- Sidebar de navegación colapsable
- 3 modos de vista: Expandido, Compacto y Mini
- Vistas de detalle dedicadas para cada componente
- Gráficas en tiempo real
- Barra de título personalizada

## Stack tecnológico
| Tecnología | Uso |
|---|---|
| [Tauri 2](https://tauri.app) | Framework de escritorio (Rust + WebView) |
| Rust | Backend: lectura de sistema y comunicación con el frontend |
| JavaScript / HTML / CSS | Frontend: interfaz de usuario |
| [Chart.js](https://www.chartjs.org) | Gráficas en tiempo real |
| [LibreHardwareMonitor](https://github.com/LibreHardwareMonitor/LibreHardwareMonitor) | Lectura de sensores de hardware |
| [sysinfo](https://crates.io/crates/sysinfo) | Información de CPU, RAM, discos y red |
| [nvml-wrapper](https://crates.io/crates/nvml-wrapper) | Monitorización GPU NVIDIA |

## Requisitos
- Windows 10/11 (64-bit)
- Ejecutar como **administrador** (necesario para leer sensores de hardware)
- GPU NVIDIA (opcional, para monitorización de GPU)

## Instalación
Descarga el instalador desde la [última release](https://github.com/Amslide/monitorxpress/releases/latest) y ejecútalo como administrador.

## Compilar desde el código fuente
```bash
# Requisitos: Node.js, Rust, cargo
git clone https://github.com/Amslide/monitorxpress.git
cd monitorxpress
npm install
npx tauri build

El ejecutable se genera en src-tauri/target/release/monitor-xpress.exe.
```

## Privacidad
Monitor Xpress no recopila, transmite ni almacena datos personales. Toda la información se procesa localmente. Sin cookies, sin telemetría, sin conexiones externas.

## Licencia
Este proyecto se distribuye bajo la Mozilla Public License 2.0 (MPL-2.0).

#Software libre y sin fines de lucro.

## Reconocimientos
Monitor Xpress utiliza LibreHardwareMonitor (MPL-2.0) para la lectura de sensores de hardware. Agradecemos a su equipo por hacer posible el acceso a datos de hardware de forma libre y abierta.

## Contacto
Atomicode®
Web: [www.atomicode.net](https://www.atomicode.net)
Correo: soporte@atomicode.net
