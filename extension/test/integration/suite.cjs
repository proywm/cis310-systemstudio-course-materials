const assert = require('node:assert/strict');
const vscode = require('vscode');

const EXTENSION_ID = 'probir-roy.systemstudio-cis310';
const REQUIRED_COMMANDS = [
  'systemstudioCis310.openSetupGuide',
  'systemstudioCis310.openUnitTestCenter',
  'systemstudioCis310.openStudentHelper',
  'systemstudioCis310.openPracticeCenter',
  'systemstudioCis310.openCourseworkCenter',
  'systemstudioCis310.openGuidedLabs',
  'systemstudioCis310.openLessonText',
  'systemstudioCis310.openCourseCalendar',
  'systemstudioCis310.checkEnvironment',
  'systemstudioCis310.createCircuit',
  'systemstudioCis310.testCircuit',
  'systemstudioCis310.openNasmWorkbench',
  'systemstudioCis310.buildRunAssembly'
];

async function run() {
  assert.equal(process.env.SYSTEMSTUDIO_INTEGRATION_TEST, '1');
  const extension = vscode.extensions.getExtension(EXTENSION_ID);
  assert.ok(extension, `${EXTENSION_ID} must be installed in the Extension Development Host`);
  assert.match(extension.packageJSON.version, /^\d+\.\d+\.\d+$/);
  await extension.activate();
  assert.equal(extension.isActive, true);

  const registered = new Set(await vscode.commands.getCommands(true));
  for (const command of REQUIRED_COMMANDS) {
    assert.ok(registered.has(command), `Extension Host did not register ${command}`);
  }

  const folder = vscode.workspace.workspaceFolders?.[0];
  assert.ok(folder, 'The integration workspace must be open');
  const dig = await vscode.workspace.openTextDocument(vscode.Uri.joinPath(folder.uri, 'blank-test.dig'));
  const asm = await vscode.workspace.openTextDocument(vscode.Uri.joinPath(folder.uri, 'StudentUnitTest.test.asm'));
  assert.equal(dig.languageId, 'digital-circuit');
  assert.equal(asm.languageId, 'nasm');
  assert.equal(vscode.workspace.getConfiguration('systemstudioCis310').get('canvasCourseUrl'), 'https://canvas.umd.umich.edu/courses/552144');

  const panelCommands = [
    ['systemstudioCis310.openSetupGuide', 'Setup and First Tasks'],
    ['systemstudioCis310.openUnitTestCenter', 'Student Unit Test Center'],
    ['systemstudioCis310.openStudentHelper', 'CIS 310 Help Center'],
    ['systemstudioCis310.openPracticeCenter', 'CIS 310 Learning'],
    ['systemstudioCis310.openCourseworkCenter', 'Coursework and Final Presentation'],
    ['systemstudioCis310.openGuidedLabs', 'Hands-on Lab Center'],
    ['systemstudioCis310.openLessonText', 'Accessible HTML lecture', ['lecture-01']],
    ['systemstudioCis310.openCourseCalendar', 'CIS 310 Fall 2026 Calendar']
  ];
  for (const [command, title, args = []] of panelCommands) {
    await vscode.commands.executeCommand(command, ...args);
    await waitFor(() => openTabLabels().some((label) => label.includes(title)), 5_000, `${title} did not open; tabs: ${openTabLabels().join(', ')}`);
  }

  await vscode.commands.executeCommand('systemstudioCis310.refresh');
  console.log(`SystemStudio Extension Host integration passed on ${process.platform}/${process.arch} with VS Code ${vscode.version}.`);
  await vscode.commands.executeCommand('workbench.action.closeAllEditors');
}

function openTabLabels() {
  const result = [];
  for (const group of vscode.window.tabGroups.all) {
    for (const tab of group.tabs) {
      result.push(tab.label);
    }
  }
  return result;
}

async function waitFor(predicate, timeoutMs, message) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (predicate()) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(message);
}

module.exports = { run };
