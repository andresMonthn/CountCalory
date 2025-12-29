@echo off
echo ==========================================
echo   CORRIGIENDO ACCESO A RED PARA MOVIL
echo ==========================================
echo.
echo 1. Cambiando perfil de red a "PRIVADO" (Windows bloquea redes Publicas)...
powershell -Command "Get-NetConnectionProfile | Where-Object { $_.NetworkCategory -eq 'Public' } | Set-NetConnectionProfile -NetworkCategory Private"
echo.
echo 2. Reforzando reglas de Firewall...
netsh advfirewall firewall delete rule name="Allow CountCalory Frontend"
netsh advfirewall firewall delete rule name="Allow CountCalory Backend"
netsh advfirewall firewall add rule name="Allow CountCalory Frontend" dir=in action=allow protocol=TCP localport=5173 profile=any
netsh advfirewall firewall add rule name="Allow CountCalory Backend" dir=in action=allow protocol=TCP localport=4000 profile=any
echo.
echo ==========================================
echo   LISTO! Intenta conectar tu celular ahora.
echo ==========================================
pause