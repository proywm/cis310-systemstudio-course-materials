#!/bin/sh
set -eu

program="${1:-/work/program}"
stdout_file=/work/program.stdout
stderr_file=/work/program.stderr
: > "$stdout_file"
: > "$stderr_file"

qemu-i386 -g 1234 "$program" >"$stdout_file" 2>"$stderr_file" &
qemu_pid=$!
cleanup() {
  kill "$qemu_pid" 2>/dev/null || true
  wait "$qemu_pid" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

exec gdb --quiet --interpreter=mi2 "$program"
