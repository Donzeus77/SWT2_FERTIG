$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

Start-Process powershell -ArgumentList @(
    '-NoExit',
    '-Command',
    "Set-Location '$projectRoot'; .\\mvnw.cmd -pl app spring-boot:run"
)

Start-Process powershell -ArgumentList @(
    '-NoExit',
    '-Command',
    "Set-Location '$projectRoot'; .\\mvnw.cmd -pl order_service spring-boot:run"
)
