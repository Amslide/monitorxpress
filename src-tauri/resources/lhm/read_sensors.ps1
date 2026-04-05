# Script que lee sensores directamente desde LibreHardwareMonitorLib.dll
# Sin necesidad de abrir LHM ni configurar WMI
param()

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$dllPath = Join-Path $scriptDir "LibreHardwareMonitorLib.dll"

if (-not (Test-Path $dllPath)) {
    Write-Output '{"error":"DLL not found","sensors":[],"cpu_temp":0}'
    exit 0
}

try {
    Add-Type -Path $dllPath

    $computer = New-Object LibreHardwareMonitor.Hardware.Computer
    $computer.IsCpuEnabled = $true
    $computer.IsGpuEnabled = $true
    $computer.IsMemoryEnabled = $true
    $computer.IsMotherboardEnabled = $true
    $computer.IsStorageEnabled = $true
    $computer.IsNetworkEnabled = $false
    $computer.IsControllerEnabled = $true
    $computer.Open()

    $sensors = @()
    $cpuTemp = 0

    foreach ($hw in $computer.Hardware) {
        $hw.Update()
        foreach ($sub in $hw.SubHardware) {
            $sub.Update()
            foreach ($sensor in $sub.Sensors) {
                if ($sensor.Value -ne $null) {
                    $unit = switch ($sensor.SensorType.ToString()) {
                        "Temperature" { "C" }
                        "Fan" { "RPM" }
                        "Power" { "W" }
                        "Voltage" { "V" }
                        "Clock" { "MHz" }
                        "Load" { "%" }
                        default { "" }
                    }
                    $sensorObj = @{
                        name = "$($hw.Name) - $($sub.Name) - $($sensor.Name)"
                        sensor_type = $sensor.SensorType.ToString()
                        value = [math]::Round($sensor.Value, 2)
                        unit = $unit
                    }
                    $sensors += $sensorObj
                }
            }
        }
        foreach ($sensor in $hw.Sensors) {
            if ($sensor.Value -ne $null) {
                $unit = switch ($sensor.SensorType.ToString()) {
                    "Temperature" { "C" }
                    "Fan" { "RPM" }
                    "Power" { "W" }
                    "Voltage" { "V" }
                    "Clock" { "MHz" }
                    "Load" { "%" }
                    default { "" }
                }
                $sensorObj = @{
                    name = "$($hw.Name) - $($sensor.Name)"
                    sensor_type = $sensor.SensorType.ToString()
                    value = [math]::Round($sensor.Value, 2)
                    unit = $unit
                }
                $sensors += $sensorObj

                # Detectar temp CPU (AMD: Tctl/Tdie, Core CCD; Intel: Package, Core)
                $isCpu = $hw.HardwareType.ToString() -match "Cpu"
                if ($isCpu -and $sensor.SensorType.ToString() -eq "Temperature" -and $sensor.Value -gt 0) {
                    $n = $sensor.Name.ToLower()
                    if ($n -match "tctl" -or $n -match "tdie" -or $n -match "package" -or $n -match "average") {
                        $cpuTemp = [math]::Round($sensor.Value, 1)
                    }
                    elseif ($cpuTemp -eq 0 -and ($n -match "core" -or $n -match "ccd")) {
                        $cpuTemp = [math]::Round($sensor.Value, 1)
                    }
                }
            }
        }
    }

    # Fallback: si no hay temp CPU del procesador, buscar en motherboard "CPU" temp
    if ($cpuTemp -eq 0) {
        foreach ($s in $sensors) {
            if ($s.sensor_type -eq "Temperature" -and $s.value -gt 0) {
                $n = $s.name.ToLower()
                if ($n -match "\bcpu\b" -and $n -notmatch "gpu") {
                    $cpuTemp = $s.value
                    break
                }
            }
        }
    }

    $computer.Close()

    $result = @{
        sensors = $sensors
        cpu_temp = $cpuTemp
        error = ""
    }

    $result | ConvertTo-Json -Depth 3 -Compress
}
catch {
    Write-Output "{`"error`":`"$($_.Exception.Message)`",`"sensors`":[],`"cpu_temp`":0}"
}
