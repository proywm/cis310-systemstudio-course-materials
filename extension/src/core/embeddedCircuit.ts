export const EMBEDDED_CIRCUIT_MODEL_VERSION = 1;

export const EMBEDDED_COMPONENT_KINDS = ['In', 'Out', 'And', 'Or', 'XOr', 'Not', 'Clock', 'D_FF'] as const;
export type EmbeddedComponentKind = typeof EMBEDDED_COMPONENT_KINDS[number];

export interface EmbeddedCircuitComponent {
  id: string;
  kind: EmbeddedComponentKind;
  label: string;
  x: number;
  y: number;
}

export interface EmbeddedCircuitEndpoint {
  componentId: string;
  port: string;
}

export interface EmbeddedCircuitConnection {
  id: string;
  from: EmbeddedCircuitEndpoint;
  to: EmbeddedCircuitEndpoint;
}

export interface EmbeddedCircuitModel {
  version: number;
  components: EmbeddedCircuitComponent[];
  connections: EmbeddedCircuitConnection[];
}

export interface EmbeddedCircuitParseResult {
  model: EmbeddedCircuitModel;
  unsupported: string[];
}

export interface EmbeddedCircuitEvaluation {
  componentValues: Record<string, boolean>;
  outputValues: Record<string, boolean | undefined>;
  unresolvedComponentIds: string[];
}

interface Point { x: number; y: number }
interface PortDescription extends Point { componentId: string; port: string; direction: 'input' | 'output' }

const MAX_COMPONENTS = 200;
const MAX_CONNECTIONS = 500;
const ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;
const KIND_SET = new Set<string>(EMBEDDED_COMPONENT_KINDS);

export function emptyEmbeddedCircuit(): EmbeddedCircuitModel {
  return { version: EMBEDDED_CIRCUIT_MODEL_VERSION, components: [], connections: [] };
}

export function validateEmbeddedCircuit(value: unknown): EmbeddedCircuitModel | undefined {
  if (!isRecord(value) || value.version !== EMBEDDED_CIRCUIT_MODEL_VERSION ||
      !Array.isArray(value.components) || !Array.isArray(value.connections) ||
      value.components.length > MAX_COMPONENTS || value.connections.length > MAX_CONNECTIONS) {
    return undefined;
  }

  const components: EmbeddedCircuitComponent[] = [];
  const componentIds = new Set<string>();
  for (const candidate of value.components) {
    if (!isRecord(candidate) || typeof candidate.id !== 'string' || !ID_PATTERN.test(candidate.id) ||
        componentIds.has(candidate.id) || typeof candidate.kind !== 'string' || !KIND_SET.has(candidate.kind) ||
        typeof candidate.label !== 'string' || candidate.label.length > 32 ||
        !safeCoordinate(candidate.x) || !safeCoordinate(candidate.y)) {
      return undefined;
    }
    componentIds.add(candidate.id);
    components.push({
      id: candidate.id,
      kind: candidate.kind as EmbeddedComponentKind,
      label: candidate.label,
      x: candidate.x,
      y: candidate.y
    });
  }

  const componentMap = new Map(components.map((component) => [component.id, component]));
  const connections: EmbeddedCircuitConnection[] = [];
  const connectionIds = new Set<string>();
  const occupiedInputs = new Set<string>();
  for (const candidate of value.connections) {
    if (!isRecord(candidate) || typeof candidate.id !== 'string' || !ID_PATTERN.test(candidate.id) ||
        connectionIds.has(candidate.id) || !isEndpoint(candidate.from) || !isEndpoint(candidate.to)) {
      return undefined;
    }
    const from = candidate.from;
    const to = candidate.to;
    const fromComponent = componentMap.get(from.componentId);
    const toComponent = componentMap.get(to.componentId);
    if (!fromComponent || !toComponent || fromComponent.id === toComponent.id ||
        !outputPorts(fromComponent).some((port) => port.port === from.port) ||
        !inputPorts(toComponent).some((port) => port.port === to.port)) {
      return undefined;
    }
    const targetKey = `${to.componentId}:${to.port}`;
    if (occupiedInputs.has(targetKey)) {
      return undefined;
    }
    occupiedInputs.add(targetKey);
    connectionIds.add(candidate.id);
    connections.push({
      id: candidate.id,
      from: { componentId: from.componentId, port: from.port },
      to: { componentId: to.componentId, port: to.port }
    });
  }
  return { version: EMBEDDED_CIRCUIT_MODEL_VERSION, components, connections };
}

export function parseDigitalCircuit(xml: string): EmbeddedCircuitParseResult {
  if (typeof xml !== 'string' || xml.length > 2_000_000) {
    return { model: emptyEmbeddedCircuit(), unsupported: ['The circuit file is too large for the embedded course editor.'] };
  }
  const unsupported = new Set<string>();
  const version = Number(xml.match(/<version>\s*(\d+)\s*<\/version>/)?.[1] ?? '1');
  if (version !== 1) unsupported.add(`Digital file version ${version}`);
  const circuitAttributes = xml.match(/<version>[\s\S]*?<\/version>\s*<attributes>([\s\S]*?)<\/attributes>/)?.[1]?.trim();
  if (circuitAttributes) unsupported.add('circuit-level attributes');
  const measurementOrdering = xml.match(/<measurementOrdering>([\s\S]*?)<\/measurementOrdering>/)?.[1]?.trim();
  if (measurementOrdering) unsupported.add('measurement ordering');

  const components: EmbeddedCircuitComponent[] = [];
  const elementPattern = /<visualElement>([\s\S]*?)<\/visualElement>/g;
  let elementMatch: RegExpExecArray | null;
  let elementIndex = 0;
  while ((elementMatch = elementPattern.exec(xml)) !== null) {
    const body = elementMatch[1] ?? '';
    const rawKind = decodeXml(body.match(/<elementName>\s*([\s\S]*?)\s*<\/elementName>/)?.[1] ?? 'Unknown').trim();
    const position = body.match(/<pos\s+x="(-?\d+)"\s+y="(-?\d+)"\s*\/>/);
    if (!KIND_SET.has(rawKind)) {
      unsupported.add(rawKind);
      elementIndex += 1;
      continue;
    }
    if (!position) {
      unsupported.add(`${rawKind} without a readable position`);
      elementIndex += 1;
      continue;
    }
    const rotation = Number(body.match(/<rotation\s+rotation="(\d+)"\s*\/>/)?.[1] ?? '0');
    const inputs = Number(body.match(/<string>Inputs<\/string>\s*<int>(\d+)<\/int>/)?.[1] ?? '2');
    const allowedAttributes = new Set(['Label']);
    if (rawKind === 'Clock') allowedAttributes.add('runRealTime');
    if (rawKind === 'D_FF' || rawKind === 'And' || rawKind === 'Or' || rawKind === 'XOr') allowedAttributes.add('Inputs');
    const attributeKeys = [...body.matchAll(/<entry>\s*<string>([\s\S]*?)<\/string>/g)].map((match) => decodeXml(match[1] ?? '').trim());
    for (const key of attributeKeys) {
      if (!allowedAttributes.has(key)) unsupported.add(`${rawKind} attribute ${key}`);
    }
    if (rotation !== 0) unsupported.add(`${rawKind} rotation ${rotation}`);
    if ((rawKind === 'And' || rawKind === 'Or' || rawKind === 'XOr') && inputs !== 2) {
      unsupported.add(`${rawKind} with ${inputs} inputs`);
    }
    const label = decodeXml(body.match(/<string>Label<\/string>\s*<string>([\s\S]*?)<\/string>/)?.[1] ?? defaultLabel(rawKind as EmbeddedComponentKind, elementIndex));
    components.push({
      id: `c${elementIndex}`,
      kind: rawKind as EmbeddedComponentKind,
      label: label.slice(0, 32),
      x: Number(position[1]),
      y: Number(position[2])
    });
    elementIndex += 1;
  }

  const wires: Array<[Point, Point]> = [];
  const wirePattern = /<wire>\s*<p1\s+x="(-?\d+)"\s+y="(-?\d+)"\s*\/>\s*<p2\s+x="(-?\d+)"\s+y="(-?\d+)"\s*\/>\s*<\/wire>/g;
  let wireMatch: RegExpExecArray | null;
  while ((wireMatch = wirePattern.exec(xml)) !== null) {
    wires.push([
      { x: Number(wireMatch[1]), y: Number(wireMatch[2]) },
      { x: Number(wireMatch[3]), y: Number(wireMatch[4]) }
    ]);
  }

  const union = new CoordinateUnion();
  for (const [p1, p2] of wires) union.join(pointKey(p1), pointKey(p2));
  const ports = components.flatMap(componentPorts);
  for (const port of ports) union.ensure(pointKey(port));
  const sourcesByRoot = new Map<string, PortDescription[]>();
  for (const port of ports.filter((candidate) => candidate.direction === 'output')) {
    const root = union.find(pointKey(port));
    const list = sourcesByRoot.get(root) ?? [];
    list.push(port);
    sourcesByRoot.set(root, list);
  }

  const connections: EmbeddedCircuitConnection[] = [];
  for (const target of ports.filter((candidate) => candidate.direction === 'input')) {
    const sources = sourcesByRoot.get(union.find(pointKey(target))) ?? [];
    if (sources.length > 1) {
      unsupported.add(`multiple drivers at ${target.componentId}:${target.port}`);
      continue;
    }
    const source = sources[0];
    if (!source || source.componentId === target.componentId) continue;
    connections.push({
      id: `w${connections.length}`,
      from: { componentId: source.componentId, port: source.port },
      to: { componentId: target.componentId, port: target.port }
    });
  }
  if (wires.length !== connections.length) unsupported.add('routed or branched wire geometry');

  return {
    model: { version: EMBEDDED_CIRCUIT_MODEL_VERSION, components, connections },
    unsupported: [...unsupported].filter(Boolean).sort()
  };
}

export function serializeDigitalCircuit(modelValue: unknown): string {
  const model = validateEmbeddedCircuit(modelValue);
  if (!model) throw new Error('The embedded circuit model is invalid.');
  const elements = model.components.map((component) => serializeComponent(component)).join('\n');
  const componentMap = new Map(model.components.map((component) => [component.id, component]));
  const wires = model.connections.map((connection) => {
    const from = outputPorts(componentMap.get(connection.from.componentId)!).find((port) => port.port === connection.from.port)!;
    const to = inputPorts(componentMap.get(connection.to.componentId)!).find((port) => port.port === connection.to.port)!;
    return `    <wire>\n      <p1 x="${from.x}" y="${from.y}"/>\n      <p2 x="${to.x}" y="${to.y}"/>\n    </wire>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="utf-8"?>\n<circuit>\n  <version>1</version>\n  <attributes/>\n  <visualElements>${elements ? `\n${elements}\n  ` : ''}</visualElements>\n  <wires>${wires ? `\n${wires}\n  ` : ''}</wires>\n</circuit>\n`;
}

export function evaluateEmbeddedCircuit(
  modelValue: unknown,
  inputValues: Readonly<Record<string, boolean>> = {},
  flipFlopState: Readonly<Record<string, boolean>> = {}
): EmbeddedCircuitEvaluation {
  const model = validateEmbeddedCircuit(modelValue);
  if (!model) throw new Error('The embedded circuit model is invalid.');
  const values: Record<string, boolean> = {};
  for (const component of model.components) {
    if (component.kind === 'In' || component.kind === 'Clock') values[component.id] = inputValues[component.id] ?? false;
    if (component.kind === 'D_FF') values[component.id] = flipFlopState[component.id] ?? false;
  }
  const inbound = new Map(model.connections.map((connection) => [`${connection.to.componentId}:${connection.to.port}`, connection.from.componentId]));
  for (let pass = 0; pass < model.components.length + 2; pass += 1) {
    let changed = false;
    for (const component of model.components) {
      if (component.id in values || component.kind === 'D_FF') continue;
      const read = (port: string): boolean | undefined => {
        const source = inbound.get(`${component.id}:${port}`);
        return source === undefined ? undefined : values[source];
      };
      let next: boolean | undefined;
      if (component.kind === 'Out' || component.kind === 'Not') {
        const input = read('in');
        if (input !== undefined) next = component.kind === 'Not' ? !input : input;
      } else if (component.kind === 'And' || component.kind === 'Or' || component.kind === 'XOr') {
        const a = read('a');
        const b = read('b');
        if (a !== undefined && b !== undefined) {
          next = component.kind === 'And' ? a && b : component.kind === 'Or' ? a || b : a !== b;
        }
      }
      if (next !== undefined) {
        values[component.id] = next;
        changed = true;
      }
    }
    if (!changed) break;
  }
  const outputValues: Record<string, boolean | undefined> = {};
  for (const component of model.components.filter((candidate) => candidate.kind === 'Out')) {
    outputValues[component.label || component.id] = values[component.id];
  }
  return {
    componentValues: values,
    outputValues,
    unresolvedComponentIds: model.components.filter((component) => !(component.id in values)).map((component) => component.id)
  };
}

export function clockEmbeddedCircuit(
  modelValue: unknown,
  beforeInputs: Readonly<Record<string, boolean>>,
  afterInputs: Readonly<Record<string, boolean>>,
  flipFlopState: Readonly<Record<string, boolean>> = {}
): Record<string, boolean> {
  const model = validateEmbeddedCircuit(modelValue);
  if (!model) throw new Error('The embedded circuit model is invalid.');
  const evaluation = evaluateEmbeddedCircuit(model, afterInputs, flipFlopState);
  const inbound = new Map(model.connections.map((connection) => [`${connection.to.componentId}:${connection.to.port}`, connection.from.componentId]));
  const nextState = { ...flipFlopState };
  for (const flipFlop of model.components.filter((component) => component.kind === 'D_FF')) {
    const clockSource = inbound.get(`${flipFlop.id}:clk`);
    const dataSource = inbound.get(`${flipFlop.id}:d`);
    if (clockSource && dataSource && !(beforeInputs[clockSource] ?? false) && (afterInputs[clockSource] ?? false)) {
      nextState[flipFlop.id] = evaluation.componentValues[dataSource] ?? false;
    }
  }
  return nextState;
}

export function componentPorts(component: EmbeddedCircuitComponent): PortDescription[] {
  return [...inputPorts(component), ...outputPorts(component)];
}

function inputPorts(component: EmbeddedCircuitComponent): PortDescription[] {
  const base = { componentId: component.id, direction: 'input' as const };
  switch (component.kind) {
    case 'Out': case 'Not': return [{ ...base, port: 'in', x: component.x, y: component.y }];
    case 'And': case 'Or': case 'XOr': return [
      { ...base, port: 'a', x: component.x, y: component.y },
      { ...base, port: 'b', x: component.x, y: component.y + 40 }
    ];
    case 'D_FF': return [
      { ...base, port: 'd', x: component.x, y: component.y },
      { ...base, port: 'clk', x: component.x - 20, y: component.y + 20 }
    ];
    default: return [];
  }
}

function outputPorts(component: EmbeddedCircuitComponent): PortDescription[] {
  const base = { componentId: component.id, direction: 'output' as const, port: 'out' };
  switch (component.kind) {
    case 'In': case 'Clock': return [{ ...base, x: component.x, y: component.y }];
    case 'Not': return [{ ...base, x: component.x + 40, y: component.y }];
    case 'And': case 'Or': case 'XOr': return [{ ...base, x: component.x + 60, y: component.y + 20 }];
    case 'D_FF': return [{ ...base, port: 'q', x: component.x + 60, y: component.y }];
    default: return [];
  }
}

function serializeComponent(component: EmbeddedCircuitComponent): string {
  const attributes: string[] = [];
  if (component.label) {
    attributes.push(`      <entry>\n        <string>Label</string>\n        <string>${escapeXml(component.label)}</string>\n      </entry>`);
  }
  if (component.kind === 'Clock') {
    attributes.push('      <entry>\n        <string>runRealTime</string>\n        <boolean>false</boolean>\n      </entry>');
  }
  if (component.kind === 'D_FF') {
    attributes.push('      <entry>\n        <string>Inputs</string>\n        <int>1</int>\n      </entry>');
  }
  const attributeXml = attributes.length ? `<elementAttributes>\n${attributes.join('\n')}\n    </elementAttributes>` : '<elementAttributes/>';
  return `    <visualElement>\n      <elementName>${component.kind}</elementName>\n      ${attributeXml}\n      <pos x="${component.x}" y="${component.y}"/>\n    </visualElement>`;
}

function defaultLabel(kind: EmbeddedComponentKind, index: number): string {
  if (kind === 'In') return `IN${index + 1}`;
  if (kind === 'Out') return `OUT${index + 1}`;
  if (kind === 'Clock') return 'CLK';
  if (kind === 'D_FF') return 'Q';
  return kind.toUpperCase();
}

function escapeXml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
}

function decodeXml(value: string): string {
  return value.replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&quot;', '"').replaceAll('&apos;', "'").replaceAll('&amp;', '&');
}

function pointKey(point: Point): string { return `${point.x},${point.y}`; }
function safeCoordinate(value: unknown): value is number { return Number.isInteger(value) && Number(value) >= -1000 && Number(value) <= 5000; }
function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null; }
function isEndpoint(value: unknown): value is EmbeddedCircuitEndpoint {
  return isRecord(value) && typeof value.componentId === 'string' && ID_PATTERN.test(value.componentId) &&
    typeof value.port === 'string' && ID_PATTERN.test(value.port);
}

class CoordinateUnion {
  private readonly parent = new Map<string, string>();

  ensure(value: string): void {
    if (!this.parent.has(value)) this.parent.set(value, value);
  }

  find(value: string): string {
    this.ensure(value);
    const parent = this.parent.get(value)!;
    if (parent === value) return value;
    const root = this.find(parent);
    this.parent.set(value, root);
    return root;
  }

  join(a: string, b: string): void {
    const rootA = this.find(a);
    const rootB = this.find(b);
    if (rootA !== rootB) this.parent.set(rootB, rootA);
  }
}
