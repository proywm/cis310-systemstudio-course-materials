interface NativeDigitalStatus {
  integrityVerified: boolean;
  java: { supported: boolean };
}

/** Native fallback is possible only when this extension host has a display and a usable Java runtime. */
export function nativeDigitalFallbackAvailable(
  platform: NodeJS.Platform,
  environment: NodeJS.ProcessEnv,
  status: NativeDigitalStatus
): boolean {
  if (!status.integrityVerified || !status.java.supported) return false;
  return platform === 'win32'
    || platform === 'darwin'
    || (platform === 'linux' && Boolean(environment.DISPLAY || environment.WAYLAND_DISPLAY));
}
