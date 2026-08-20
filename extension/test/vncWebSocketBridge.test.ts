import assert from 'node:assert/strict';
import { createServer } from 'node:net';
import { describe, it } from 'node:test';
import { WebSocket } from 'ws';
import { createVncWebSocketBridge } from '../src/core/vncWebSocketBridge';

describe('Full Digital binary display transport', () => {
  it('carries RFB bytes in both directions without modification', async () => {
    const tcpServer = createServer((socket) => socket.on('data', (data) => socket.write(data)));
    await new Promise<void>((resolve, reject) => {
      tcpServer.once('error', reject);
      tcpServer.listen(0, '127.0.0.1', () => resolve());
    });
    const tcpAddress = tcpServer.address();
    assert.ok(tcpAddress && typeof tcpAddress !== 'string');

    const messages: string[] = [];
    const bridge = await createVncWebSocketBridge(tcpAddress.port, 'private-test-token', {
      appendLine: (value) => messages.push(value)
    });
    const client = new WebSocket(`ws://127.0.0.1:${bridge.port}/private-test-token`);

    try {
      await new Promise<void>((resolve, reject) => {
        client.once('open', resolve);
        client.once('error', reject);
      });
      const expected = Buffer.from([0x52, 0x46, 0x42, 0x20, 0x00, 0xff, 0x7f]);
      const echoed = new Promise<Buffer>((resolve, reject) => {
        client.once('message', (data) => resolve(Buffer.isBuffer(data) ? data : Buffer.from(data as ArrayBuffer)));
        client.once('error', reject);
      });
      client.send(expected);
      assert.deepEqual(await echoed, expected);
      assert.deepEqual(messages, []);
    } finally {
      client.close();
      for (const socket of bridge.sockets) socket.terminate();
      await new Promise<void>((resolve) => bridge.server.close(() => resolve()));
      await new Promise<void>((resolve) => tcpServer.close(() => resolve()));
    }
  });
});
