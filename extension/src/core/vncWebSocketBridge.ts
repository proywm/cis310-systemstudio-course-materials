import { createServer, type Server as HttpServer } from 'node:http';
import { createConnection } from 'node:net';
import { WebSocket, WebSocketServer } from 'ws';

export interface BridgeLogger {
  appendLine(value: string): void;
}

export interface VncWebSocketBridge {
  readonly server: HttpServer;
  readonly port: number;
  readonly sockets: Set<WebSocket>;
}

/**
 * Proxies binary WebSocket frames to a local RFB TCP server. noVNC speaks RFB
 * over WebSocket; x11vnc speaks the same bytes over TCP. This layer deliberately
 * does not inspect or alter the simulator's display or input protocol.
 */
export async function createVncWebSocketBridge(
  vncPort: number,
  token: string,
  logger: BridgeLogger
): Promise<VncWebSocketBridge> {
  const server = createServer((_request, response) => {
    response.writeHead(404, { 'Content-Type': 'text/plain', 'Cache-Control': 'no-store' });
    response.end('Not found');
  });
  const sockets = new Set<WebSocket>();
  const websocketServer = new WebSocketServer({ noServer: true, perMessageDeflate: false });

  server.on('upgrade', (request, socket, head) => {
    const requestPath = new URL(request.url ?? '/', 'http://127.0.0.1').pathname;
    if (requestPath !== `/${token}`) {
      socket.destroy();
      return;
    }
    websocketServer.handleUpgrade(request, socket, head, (client) => {
      websocketServer.emit('connection', client, request);
    });
  });

  websocketServer.on('connection', (client) => {
    sockets.add(client);
    const upstream = createConnection({ host: '127.0.0.1', port: vncPort });
    client.binaryType = 'arraybuffer';

    client.on('message', (data) => {
      const payload = Array.isArray(data)
        ? Buffer.concat(data)
        : Buffer.isBuffer(data) ? data : Buffer.from(data);
      if (!upstream.destroyed) upstream.write(payload);
    });
    upstream.on('data', (data) => {
      if (client.readyState === WebSocket.OPEN) client.send(data, { binary: true });
    });

    const close = (): void => {
      sockets.delete(client);
      if (!upstream.destroyed) upstream.destroy();
      if (client.readyState === WebSocket.OPEN || client.readyState === WebSocket.CONNECTING) client.close();
    };
    client.on('close', close);
    client.on('error', (error) => {
      logger.appendLine(`Full Digital webview socket error: ${error.message}`);
      close();
    });
    upstream.on('close', close);
    upstream.on('error', (error) => {
      logger.appendLine(`Full Digital VNC socket error: ${error.message}`);
      close();
    });
  });

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve());
  });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Could not determine the Full Digital bridge port.');
  return { server, port: address.port, sockets };
}
