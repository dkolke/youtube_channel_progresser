rem ----- made by lumo -----
@echo off
:: ------------------------------------------------------------
:: start‑local‑server.bat
::   • Startet einen Python‑basierten HTTP‑Server
::   • Öffnet automatisch den Standard‑Browser
::   • Nutzt das Verzeichnis, in dem die .bat liegt
:: ------------------------------------------------------------

rem ----- 1. Arbeitsverzeichnis auf den Ordner der .bat setzen ----------
rem %~dp0 = Laufwerk + Pfad der Batch‑Datei (inkl. abschließendem "\")
pushd "%~dp0"

rem ----- 2. Prüfen, ob Python 3 verfügbar ist -------------------------
python -c "import sys; assert sys.version_info >= (3,0)" 2>nul
if errorlevel 1 (
    echo.
    echo *** ERROR ***
    echo Python 3 konnte nicht gefunden werden.
    echo Bitte stelle sicher, dass Python 3 installiert ist
    echo und dass der Installationspfad zu deiner PATH‑Umgebungsvariable
    echo hinzugefügt wurde.
    popd
    pause
    exit /b 1
)

rem ----- 3. Port festlegen (kann bei Bedarf geändert werden) ---------
set "PORT=8000"

rem ----- 4. Server starten (im Hintergrund) ---------------------------
rem Wir starten den Server in einem separaten Prozess, damit wir
rem sofort den Browser öffnen können.
start "Python HTTP Server" cmd /c ^
    python -m http.server %PORT% --bind 127.0.0.1

rem ----- 5. Browser öffnen -------------------------------------------
rem Warte kurz, damit der Server Zeit hat, den Socket zu binden.
timeout /t 1 >nul
start "" "http://127.0.0.1:%PORT%/"

rem ----- 6. Hinweis für den Nutzer ----------------------------------
echo.
echo --------------------------------------------------------------
echo Der lokale Server läuft jetzt unter http://127.0.0.1:%PORT%/
echo Schließe dieses Fenster (oder drücke STRG+C), um den Server zu beenden.
echo --------------------------------------------------------------

rem ----- 7. Auf Benutzereingabe warten (optional) --------------------
rem Wenn du das Fenster offen lassen willst, damit das Skript nicht sofort
rem endet, kannst du folgendes aktivieren:
rem   pause
rem   :: oder --
rem   echo Druecke eine beliebige Taste, um den Server zu stoppen...
rem   pause >nul

rem ----- 8. Aufräumen ------------------------------------------------
popd