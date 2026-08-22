#!/bin/sh
set -eu

display=:99
cleanup() {
  if [ -n "${vnc_pid:-}" ]; then kill "$vnc_pid" 2>/dev/null || true; fi
  if [ -n "${xvfb_pid:-}" ]; then kill "$xvfb_pid" 2>/dev/null || true; fi
}
trap cleanup EXIT INT TERM

Xvfb "$display" -screen 0 1440x900x24 -nolisten tcp -noreset &
xvfb_pid=$!

attempt=0
while [ ! -S /tmp/.X11-unix/X99 ]; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge 150 ]; then
    echo "Timed out waiting for the private X11 display." >&2
    exit 1
  fi
  sleep 0.1
done

x11vnc -display "$display" -listen 0.0.0.0 -forever -shared -nopw -rfbport 5900 -noxdamage -xkb &
vnc_pid=$!

export DISPLAY="$display"
export GDK_BACKEND=x11
export _JAVA_AWT_WM_NONREPARENTING=1
mkdir -p /home/digital/.java/.userPrefs
if [ ! -w /home/digital ]; then
  echo "Digital's container home is not writable; preferences and crash logs cannot be saved." >&2
  exit 1
fi
exec java \
  -Duser.home=/home/digital \
  -Djava.util.prefs.userRoot=/home/digital/.java/.userPrefs \
  -Dapple.awt.application.name="SystemStudio Digital" \
  -jar /opt/digital/Digital.jar "$@"
