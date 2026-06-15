# Script para automatizar la compilación del Frontend y del wrapper de Tauri
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "1. Compilando el Frontend de React..." -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Green
npm run build

# Rutas de origen y destino
$sourcePath = "dist"
$tauriWrapperPath = "..\Sistema\Accidentes e inspecciones ASHO"
$destPath = "$tauriWrapperPath\dist"

if (-not (Test-Path $tauriWrapperPath)) {
    Write-Host "ADVERTENCIA: No se encontró la carpeta del wrapper de Tauri en la ruta relativa: $tauriWrapperPath" -ForegroundColor Red
    Write-Host "Por favor, verifica que la carpeta 'Accidentes e inspecciones ASHO' existe al mismo nivel de tu frontend." -ForegroundColor Red
    Exit
}

Write-Host "==========================================================" -ForegroundColor Green
Write-Host "2. Copiando archivos compilados al wrapper de Tauri..." -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Green

if (Test-Path $destPath) {
    Remove-Item -Path "$destPath\*" -Recurse -Force
} else {
    New-Item -ItemType Directory -Path $destPath -Force | Out-Null
}

Copy-Item -Path "$sourcePath\*" -Destination $destPath -Recurse -Force
Write-Host "¡Archivos copiados con éxito a: $destPath!" -ForegroundColor Green

Write-Host "==========================================================" -ForegroundColor Green
Write-Host "3. Compilando la aplicación de escritorio con Tauri..." -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Green

Push-Location $tauriWrapperPath
if (Get-Command cargo -ErrorAction SilentlyContinue) {
    # Si cargo está instalado globalmente (típico de Tauri dev)
    cargo tauri build
} else {
    # Fallback con npx tauri
    npx tauri build
}
Pop-Location

Write-Host "==========================================================" -ForegroundColor Green
Write-Host "¡Proceso finalizado!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
