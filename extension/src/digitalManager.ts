import { spawn, type ChildProcess } from 'node:child_process';
import { createHash } from 'node:crypto';
import { access, cp, mkdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import * as path from 'node:path';
import * as vscode from 'vscode';
import { equalsSha256, sha256File } from './core/checksum';
import { BLANK_DIGITAL_CIRCUIT } from './core/circuitTemplate';
import { DIGITAL_RELEASE, MINIMUM_JAVA_MAJOR } from './core/digitalRelease';
import { downloadFile } from './core/download';
import { isSupportedJava, parseJavaVersion, type ParsedJavaVersion } from './core/javaVersion';
import { runProcess, type ProcessResult } from './core/processRunner';
import { extractZipSafely } from './core/safeZip';

export interface JavaStatus {
  executable: string;
  available: boolean;
  supported: boolean;
  version?: ParsedJavaVersion;
  detail: string;
}

export interface DigitalStatus {
  installed: boolean;
  integrityVerified: boolean;
  version: string;
  jarPath: string;
  java: JavaStatus;
}

export interface CircuitTestResult {
  passed: boolean;
  output: string;
  process: ProcessResult;
}

interface InstallMarker {
  version: string;
  installedAt: string;
  sourceUrl: string;
  archiveSha256: string;
  jarSha256: string;
  license: string;
}

export class DigitalManager {
  private installPromise: Promise<void> | undefined;

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly output: vscode.OutputChannel
  ) {}

  get versionDirectory(): string {
    return path.join(this.context.globalStorageUri.fsPath, 'digital', DIGITAL_RELEASE.version);
  }

  get digitalHome(): string {
    return path.join(this.versionDirectory, 'Digital');
  }

  get jarPath(): string {
    return path.join(this.versionDirectory, ...DIGITAL_RELEASE.jarRelativePath);
  }

  get javaExecutable(): string {
    return vscode.workspace.getConfiguration('systemstudioCis310').get<string>('javaPath', 'java').trim() || 'java';
  }

  async getStatus(): Promise<DigitalStatus> {
    const java = await this.checkJava();
    let installed = false;
    let integrityVerified = false;
    try {
      await access(this.jarPath);
      installed = true;
      integrityVerified = equalsSha256(await sha256File(this.jarPath), DIGITAL_RELEASE.jarSha256);
    } catch {
      installed = false;
    }
    return {
      installed,
      integrityVerified,
      version: DIGITAL_RELEASE.displayVersion,
      jarPath: this.jarPath,
      java
    };
  }

  async checkJava(): Promise<JavaStatus> {
    const executable = this.javaExecutable;
    try {
      const result = await runProcess(executable, ['-version'], { timeoutMs: 10_000, maxOutputBytes: 128 * 1024 });
      const detail = `${result.stdout}\n${result.stderr}`.trim();
      const version = parseJavaVersion(detail);
      return {
        executable,
        available: result.code === 0 || version !== undefined,
        supported: isSupportedJava(version),
        version,
        detail
      };
    } catch (error) {
      return {
        executable,
        available: false,
        supported: false,
        detail: error instanceof Error ? error.message : String(error)
      };
    }
  }

  async install(progress: vscode.Progress<{ message?: string; increment?: number }>, token: vscode.CancellationToken): Promise<void> {
    if (!this.installPromise) {
      this.installPromise = this.performInstall(progress, token).finally(() => {
        this.installPromise = undefined;
      });
    }
    return this.installPromise;
  }

  private async performInstall(
    progress: vscode.Progress<{ message?: string; increment?: number }>,
    token: vscode.CancellationToken
  ): Promise<void> {
    const storageRoot = this.context.globalStorageUri.fsPath;
    const digitalRoot = path.join(storageRoot, 'digital');
    const downloads = path.join(digitalRoot, 'downloads');
    const archive = path.join(downloads, DIGITAL_RELEASE.archiveName);
    const partialArchive = `${archive}.part`;
    const staging = path.join(digitalRoot, `.staging-${DIGITAL_RELEASE.version}-${process.pid}`);

    await mkdir(downloads, { recursive: true });
    await rm(staging, { recursive: true, force: true });
    try {
      let archiveReady = false;
      try {
        archiveReady = equalsSha256(await sha256File(archive), DIGITAL_RELEASE.archiveSha256);
      } catch {
        archiveReady = false;
      }

      if (!archiveReady) {
        progress.report({ message: `Downloading Digital ${DIGITAL_RELEASE.displayVersion}…` });
        let lastPercent = 0;
        await downloadFile(DIGITAL_RELEASE.downloadUrl, partialArchive, {
          cancellation: token,
          onProgress: ({ receivedBytes, totalBytes }) => {
            if (!totalBytes) {
              progress.report({ message: `Downloaded ${formatBytes(receivedBytes)}…` });
              return;
            }
            const percent = Math.floor((receivedBytes / totalBytes) * 100);
            const increment = Math.max(0, percent - lastPercent);
            lastPercent = percent;
            progress.report({ message: `Downloading Digital ${percent}%`, increment });
          }
        });
        progress.report({ message: 'Verifying Digital archive…' });
        const archiveHash = await sha256File(partialArchive);
        if (!equalsSha256(archiveHash, DIGITAL_RELEASE.archiveSha256)) {
          throw new Error(`Digital archive checksum mismatch. Expected ${DIGITAL_RELEASE.archiveSha256}, received ${archiveHash}.`);
        }
        await rm(archive, { force: true });
        await rename(partialArchive, archive);
      }

      if (token.isCancellationRequested) {
        throw new Error('Digital installation cancelled.');
      }

      progress.report({ message: 'Extracting Digital into extension storage…' });
      await mkdir(staging, { recursive: true });
      await extractZipSafely(archive, staging);

      const stagedJar = path.join(staging, ...DIGITAL_RELEASE.jarRelativePath);
      const jarHash = await sha256File(stagedJar);
      if (!equalsSha256(jarHash, DIGITAL_RELEASE.jarSha256)) {
        throw new Error(`Digital.jar checksum mismatch. Expected ${DIGITAL_RELEASE.jarSha256}, received ${jarHash}.`);
      }

      const marker: InstallMarker = {
        version: DIGITAL_RELEASE.version,
        installedAt: new Date().toISOString(),
        sourceUrl: DIGITAL_RELEASE.downloadUrl,
        archiveSha256: DIGITAL_RELEASE.archiveSha256,
        jarSha256: DIGITAL_RELEASE.jarSha256,
        license: DIGITAL_RELEASE.licenseName
      };
      await writeFile(path.join(staging, 'systemstudio-install.json'), `${JSON.stringify(marker, null, 2)}\n`, 'utf8');

      await rm(this.versionDirectory, { recursive: true, force: true });
      await rename(staging, this.versionDirectory);
      this.output.appendLine(`Installed Digital ${DIGITAL_RELEASE.displayVersion} at ${this.versionDirectory}`);
    } finally {
      await rm(partialArchive, { force: true });
      await rm(staging, { recursive: true, force: true });
    }
  }

  async launch(circuitPath?: string): Promise<void> {
    const child = await this.launchAttached(circuitPath);
    child.unref();
  }

  /**
   * Starts the unmodified upstream Digital GUI and leaves lifecycle ownership
   * with the caller. Used by the streamed desktop integration so the extension
   * can stop the private X display cleanly on shutdown.
   */
  async launchAttached(circuitPath?: string, environment: NodeJS.ProcessEnv = {}): Promise<ChildProcess> {
    await this.assertReady();
    if (circuitPath) {
      await access(circuitPath);
    }
    const args = this.guiArguments(circuitPath);
    this.output.appendLine(
      `Launching upstream Digital ${DIGITAL_RELEASE.displayVersion}${circuitPath ? ` with ${circuitPath}` : ''}.`
    );
    return new Promise<ChildProcess>((resolve, reject) => {
      const child = spawn(this.javaExecutable, args, {
        cwd: this.digitalHome,
        env: { ...this.digitalEnvironment, ...environment },
        detached: false,
        shell: false,
        stdio: 'ignore',
        windowsHide: false
      });
      child.once('error', reject);
      child.once('spawn', () => resolve(child));
    });
  }

  async createBlankCircuit(circuitPath: string): Promise<void> {
    if (path.extname(circuitPath).toLowerCase() !== '.dig') {
      throw new Error('A Digital circuit filename must use the .dig extension.');
    }
    await mkdir(path.dirname(circuitPath), { recursive: true });
    await writeFile(circuitPath, BLANK_DIGITAL_CIRCUIT, { encoding: 'utf8', flag: 'wx' });
    this.output.appendLine(`Created blank Digital circuit: ${circuitPath}`);
  }

  async runTests(circuitPath: string, token?: vscode.CancellationToken): Promise<CircuitTestResult> {
    await this.assertReady();
    await access(circuitPath);
    const result = await this.runCli(['test', '-circ', circuitPath, '-verbose'], token);
    const output = normalizeOutput(result);
    this.output.appendLine(`Digital test: ${circuitPath}`);
    this.output.appendLine(output);
    return { passed: result.code === 0 && !result.timedOut && !result.cancelled, output, process: result };
  }

  async runExternalTests(
    circuitPath: string,
    testsPath: string,
    token?: vscode.CancellationToken
  ): Promise<CircuitTestResult> {
    await this.assertReady();
    await access(circuitPath);
    await access(testsPath);
    const result = await this.runCli(['test', '-circ', circuitPath, '-tests', testsPath, '-verbose'], token);
    const output = normalizeOutput(result);
    this.output.appendLine(`Digital external preflight: ${circuitPath}`);
    this.output.appendLine(`Public test contract: ${testsPath}`);
    this.output.appendLine(output);
    return { passed: result.code === 0 && !result.timedOut && !result.cancelled, output, process: result };
  }

  async exportSvg(circuitPath: string, token?: vscode.CancellationToken): Promise<string> {
    await this.assertReady();
    const sourceStat = await stat(circuitPath);
    const fingerprint = createHash('sha256')
      .update(`${circuitPath}\0${sourceStat.mtimeMs}\0${sourceStat.size}`)
      .digest('hex')
      .slice(0, 20);
    const previewDirectory = path.join(this.context.globalStorageUri.fsPath, 'previews');
    await mkdir(previewDirectory, { recursive: true });
    const svgPath = path.join(previewDirectory, `${fingerprint}.svg`);
    const result = await this.runCli(['svg', '-dig', circuitPath, '-svg', svgPath, '-highContrast'], token);
    if (result.code !== 0 || result.timedOut || result.cancelled) {
      throw new Error(`Digital SVG export failed.\n${normalizeOutput(result)}`);
    }
    return svgPath;
  }

  async createStarterWorkspace(parentDirectory: string): Promise<string> {
    await this.assertReady();
    const target = path.join(parentDirectory, 'SystemStudio-CIS310-Starter');
    try {
      await access(target);
      throw new Error(`The starter folder already exists: ${target}.`);
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('The starter folder already exists:')) {
        throw error;
      }
    }
    const staging = path.join(parentDirectory, `.SystemStudio-CIS310-Starter.staging-${process.pid}-${Date.now()}`);
    await mkdir(path.join(staging, 'circuits', 'reference'), { recursive: true });
    await mkdir(path.join(staging, 'circuits', 'work'), { recursive: true });
    await mkdir(path.join(staging, 'course'), { recursive: true });
    await mkdir(path.join(staging, '.vscode'), { recursive: true });
    try {
      const halfAdderSource = path.join(this.digitalHome, 'examples', 'combinatorial', 'HalfAdder.dig');
      await cp(halfAdderSource, path.join(staging, 'circuits', 'reference', 'HalfAdder.dig'), {
        force: false,
        errorOnExist: true
      });

      const coursePackSource = path.join(this.context.extensionUri.fsPath, 'course-packs', 'cis310-fall2026');
      await cp(path.join(coursePackSource, 'assignments'), path.join(staging, 'course', 'assignments'), {
        recursive: true,
        force: false,
        errorOnExist: true
      });
      await cp(path.join(coursePackSource, 'presentations'), path.join(staging, 'course', 'presentations'), {
        recursive: true,
        force: false,
        errorOnExist: true
      });
      await cp(path.join(coursePackSource, 'syllabus'), path.join(staging, 'course', 'syllabus'), {
        recursive: true,
        force: false,
        errorOnExist: true,
        filter: (source) => path.extname(source).toLowerCase() !== '.tex'
      });
      await cp(
        path.join(coursePackSource, 'STUDENT_MATERIALS.md'),
        path.join(staging, 'course', 'README.md'),
        { force: false, errorOnExist: true }
      );
      await cp(
        path.join(coursePackSource, 'materials-manifest.json'),
        path.join(staging, 'course', 'materials-manifest.json'),
        { force: false, errorOnExist: true }
      );
      await cp(
        path.join(this.context.extensionUri.fsPath, 'assembly-starter'),
        path.join(staging, 'assembly'),
        { recursive: true, force: false, errorOnExist: true }
      );

      await writeFile(path.join(staging, 'README.md'), starterReadme(), { encoding: 'utf8', flag: 'wx' });
      await writeFile(
        path.join(staging, 'THIRD_PARTY_NOTICES.md'),
        starterThirdPartyNotice(),
        { encoding: 'utf8', flag: 'wx' }
      );
      await writeFile(
        path.join(staging, '.vscode', 'settings.json'),
        `${JSON.stringify({
          'files.associations': { '*.dig': 'digital-circuit', '*.asm': 'nasm' },
          'workbench.editorAssociations': {
            'course/*.md': 'vscode.markdown.preview.editor',
            'course/assignments/*.md': 'vscode.markdown.preview.editor'
          }
        }, null, 2)}\n`,
        { encoding: 'utf8', flag: 'wx' }
      );
      await rename(staging, target);
      return target;
    } finally {
      await rm(staging, { recursive: true, force: true });
    }
  }

  async containsEmbeddedTests(circuitPath: string): Promise<boolean> {
    const content = await readFile(circuitPath, 'utf8');
    return /<elementName>Testcase<\/elementName>/.test(content);
  }

  private get configurationHome(): string {
    return path.join(this.context.globalStorageUri.fsPath, 'digital', 'configuration');
  }

  private get digitalEnvironment(): NodeJS.ProcessEnv {
    return {
      ...process.env,
      XDG_CONFIG_HOME: this.configurationHome
    };
  }

  private guiArguments(circuitPath?: string): string[] {
    const args = [
      `-Duser.home=${this.configurationHome}`,
      '-Dapple.awt.application.name=SystemStudio Digital',
      '-jar',
      this.jarPath
    ];
    if (circuitPath) {
      args.push(circuitPath);
    }
    return args;
  }

  private get timeoutMs(): number {
    const seconds = vscode.workspace.getConfiguration('systemstudioCis310').get<number>('testTimeoutSeconds', 30);
    return Math.max(5, Math.min(300, seconds)) * 1000;
  }

  private async assertReady(): Promise<void> {
    const status = await this.getStatus();
    if (!status.installed || !status.integrityVerified) {
      throw new Error(`Digital ${DIGITAL_RELEASE.displayVersion} is not installed or failed its integrity check.`);
    }
    if (!status.java.available) {
      throw new Error(`Java was not found at “${status.java.executable}”. Install Java ${MINIMUM_JAVA_MAJOR}+ or configure systemstudioCis310.javaPath.`);
    }
    if (!status.java.supported) {
      throw new Error(`Java ${status.java.version?.raw ?? 'unknown'} is unsupported. Digital requires Java ${MINIMUM_JAVA_MAJOR} or newer.`);
    }
    await mkdir(this.configurationHome, { recursive: true });
  }

  private runCli(args: readonly string[], token?: vscode.CancellationToken): Promise<ProcessResult> {
    return runProcess(
      this.javaExecutable,
      [
        `-Duser.home=${this.configurationHome}`,
        '-cp',
        this.jarPath,
        'CLI',
        ...args
      ],
      {
        cwd: this.digitalHome,
        env: this.digitalEnvironment,
        timeoutMs: this.timeoutMs,
        maxOutputBytes: 2 * 1024 * 1024,
        cancellation: token
      }
    );
  }
}

function normalizeOutput(result: ProcessResult): string {
  const sections = [result.stdout.trim(), result.stderr.trim()].filter(Boolean);
  if (result.timedOut) {
    sections.push('SystemStudio stopped Digital because the operation timed out.');
  }
  if (result.cancelled) {
    sections.push('Operation cancelled.');
  }
  if (result.truncated) {
    sections.push('Output truncated at the configured safety limit.');
  }
  if (sections.length === 0) {
    sections.push(`Digital exited with code ${result.code ?? 'unknown'}.`);
  }
  return sections.join('\n');
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KiB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MiB`;
}

function starterReadme(): string {
  return `# SystemStudio CIS 310 Starter\n\n` +
    `This workspace was created by the SystemStudio CIS 310 VS Code extension.\n\n` +
    `This is an active Fall 2026 course workspace. Use packaged materials for study. ` +
    `Current Fall 2026 Canvas instructions, deadlines, points, and submission rules are authoritative.\n\n` +
    `## Start\n\n` +
    `1. Read \`course/README.md\` and the current Canvas assignment.\n` +
    `2. Open \`circuits/reference/HalfAdder.dig\` for an analogous prerequisite example.\n` +
    `3. Open the file with **Full Digital Simulator**. This is the complete upstream Digital application, including its original menus, component library, simulation, dialogs, and save behavior.\n` +
    `4. Use **Open With → SystemStudio Circuit Preview** for Digital's official in-editor SVG view.\n` +
    `5. Run **CIS 310: Run Digital Circuit Tests** or use VS Code Test Explorer.\n` +
    `6. Save your own circuits under \`circuits/work/\`, return to VS Code, and rerun the tests.\n` +
    `7. Submit the required files through the current Fall 2026 Canvas assignment.\n\n` +
    `For assembly programming, read \`assembly/README.md\`. Use the **Actual NASM Debug Workbench** ` +
    `for NASM assembly, ELF32 linking/execution, and GDB inspection. The separately labeled trace tutor is only an optional learning visualization.\n\n` +
    `No ALU, register-file, or processor solution is bundled. This protects the learning task while ` +
    `retaining a small half-adder example for tool orientation.\n\n` +
    `## Suggested learning sequence\n\n` +
    `- Verify the half-adder truth table.\n` +
    `- Trace carry and sum separately.\n` +
    `- Open the mapped lecture and assignment resources from the Course Materials view.\n` +
    `- Create each instructor-assigned circuit yourself under \`circuits/work/\`.\n`;
}

function starterThirdPartyNotice(): string {
  return `# Third-Party Notice\n\n` +
    `The reference \`.dig\` file in this workspace was copied from Digital ${DIGITAL_RELEASE.displayVersion}.\n\n` +
    `- Project: ${DIGITAL_RELEASE.sourceUrl}\n` +
    `- Release: ${DIGITAL_RELEASE.releaseUrl}\n` +
    `- License: ${DIGITAL_RELEASE.licenseName}\n` +
    `- License text: ${DIGITAL_RELEASE.licenseUrl}\n\n` +
    `SystemStudio downloads and runs the upstream Digital release rather than reimplementing its editor. The in-editor ` +
    `Linux display uses noVNC (MPL-2.0) as a transport only. The actual assembly path invokes NASM, GNU ld, GDB, ` +
    `and QEMU-i386 when the course container is used. The separate trace tutor is original SystemStudio code.\n`;
}
