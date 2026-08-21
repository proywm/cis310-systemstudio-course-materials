import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runTests } from '@vscode/test-electron';

const extensionDevelopmentPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const extensionTestsPath = path.join(extensionDevelopmentPath, 'test', 'integration', 'suite.cjs');
// macOS limits Unix-domain socket paths to roughly 104 bytes. The hosted
// runner's os.tmpdir() lives under a long /var/folders/... path, and VS Code
// appends its own IPC filename. Use the conventional short /tmp alias there.
const integrationTempBase = process.platform === 'darwin' ? '/tmp' : tmpdir();
const temporaryRoot = await mkdtemp(path.join(integrationTempBase, 'c310-vscode-'));
const workspace = path.join(temporaryRoot, 'workspace');
const userData = path.join(temporaryRoot, 'user-data');
const extensions = path.join(temporaryRoot, 'extensions');
const inheritedElectronRunAsNode = process.env.ELECTRON_RUN_AS_NODE;
const inheritedVscodeEsmEntrypoint = process.env.VSCODE_ESM_ENTRYPOINT;

try {
  // Remote-SSH extension hosts export these for their own child processes. A
  // downloaded desktop VS Code must start as Electron, not as a Node script.
  delete process.env.ELECTRON_RUN_AS_NODE;
  delete process.env.VSCODE_ESM_ENTRYPOINT;
  await mkdir(path.join(workspace, '.vscode'), { recursive: true });
  await mkdir(userData, { recursive: true });
  await mkdir(extensions, { recursive: true });
  await writeFile(path.join(workspace, '.vscode', 'settings.json'), JSON.stringify({
    'systemstudioCis310.promptToInstall': false
  }, null, 2));
  await writeFile(path.join(workspace, 'blank-test.dig'), '<?xml version="1.0" encoding="utf-8"?>\n<circuit><version>1</version><attributes/><visualElements/><wires/></circuit>\n');
  await writeFile(path.join(workspace, 'StudentUnitTest.test.asm'), 'BITS 32\nGLOBAL _start\nSECTION .text\n_start:\n  mov eax, 1\n  xor ebx, ebx\n  int 0x80\n');

  await runTests({
    version: process.env.VSCODE_TEST_VERSION || 'stable',
    extensionDevelopmentPath,
    extensionTestsPath,
    launchArgs: [
      workspace,
      '--disable-extensions',
      '--disable-workspace-trust',
      '--skip-welcome',
      '--skip-release-notes',
      '--user-data-dir', userData,
      '--extensions-dir', extensions
    ],
    extensionTestsEnv: {
      SYSTEMSTUDIO_INTEGRATION_TEST: '1'
    }
  });
} finally {
  if (inheritedElectronRunAsNode === undefined) delete process.env.ELECTRON_RUN_AS_NODE;
  else process.env.ELECTRON_RUN_AS_NODE = inheritedElectronRunAsNode;
  if (inheritedVscodeEsmEntrypoint === undefined) delete process.env.VSCODE_ESM_ENTRYPOINT;
  else process.env.VSCODE_ESM_ENTRYPOINT = inheritedVscodeEsmEntrypoint;
  await rm(temporaryRoot, { recursive: true, force: true });
}
