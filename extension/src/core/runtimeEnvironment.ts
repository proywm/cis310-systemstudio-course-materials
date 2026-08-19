export interface DisplayEnvironment {
  DISPLAY?: string;
  WAYLAND_DISPLAY?: string;
}

export function isHeadlessRemote(
  remoteName: string | undefined,
  platform: NodeJS.Platform = process.platform,
  environment: DisplayEnvironment = process.env
): boolean {
  return Boolean(
    remoteName &&
    platform === 'linux' &&
    !environment.DISPLAY &&
    !environment.WAYLAND_DISPLAY
  );
}
