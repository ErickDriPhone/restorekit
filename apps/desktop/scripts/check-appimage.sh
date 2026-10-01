#!/usr/bin/env bash
# Check archive permissions explicitly: extraction changes ownership and can
# otherwise hide an AppRun.wrapped that only the packaging user can execute.
# Then check GUI startup on a virtual display, without any connected hardware.
set -euo pipefail

if [[ $# != 1 ]]; then
  echo "Usage: $0 path/to/RestoreKit.AppImage" >&2
  exit 1
fi
appimage="$(realpath "$1")"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
cd "$work"
"$appimage" --appimage-extract > /dev/null
appdir="$work/squashfs-root"

for entry in AppRun AppRun.wrapped usr/bin/restorekit-desktop usr/bin/helper; do
  mode="$(stat -Lc '%a' "$appdir/$entry")"
  if (( (8#$mode & 5) != 5 )); then
    echo "AppImage launcher is not readable/executable by ordinary users: $entry ($mode)" >&2
    exit 1
  fi
done

mkdir "$work/home"
if ! xvfb-run -a bash -c '
  export HOME="$2" XDG_CONFIG_HOME="$2/config" XDG_CACHE_HOME="$2/cache"
  "$1/AppRun" > "$3" 2>&1 &
  pid=$!
  trap '\''kill "$pid" 2>/dev/null || true; wait "$pid" 2>/dev/null || true'\'' EXIT
  timeout 30s xdotool search --sync --onlyvisible --name "^RestoreKit$" > /dev/null || exit 1
  sleep 2
  kill -0 "$pid"
' bash "$appdir" "$work/home" "$work/startup.log"; then
  cat "$work/startup.log" >&2
  exit 1
fi
echo "AppImage permissions and GUI startup passed"
