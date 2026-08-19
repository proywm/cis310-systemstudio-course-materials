export interface ContainerIdentity {
  uid: number;
  gid: number;
}

export function assemblyRunArguments(
  imageName: string,
  workspaceRoot: string,
  buildDirectory: string,
  source: string,
  identity?: ContainerIdentity
): string[] {
  const args = [
    'run',
    '--rm',
    '--platform',
    'linux/amd64',
    '--network',
    'none',
    '--cap-drop',
    'ALL',
    '--security-opt',
    'no-new-privileges',
    '--pids-limit',
    '128',
    '--memory',
    '512m',
    '--cpus',
    '1',
    '--read-only',
    '--tmpfs',
    '/tmp:rw,noexec,nosuid,size=64m',
    '--volume',
    `${workspaceRoot}:/workspace:ro`,
    '--volume',
    `${buildDirectory}:/workspace/build:rw`
  ];
  if (identity) {
    args.push('--user', `${identity.uid}:${identity.gid}`);
  }
  args.push('--workdir', '/workspace', imageName, 'run', source);
  return args;
}
