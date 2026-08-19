import { createWriteStream } from 'node:fs';
import { mkdir, rm } from 'node:fs/promises';
import * as https from 'node:https';
import * as path from 'node:path';
import { pipeline } from 'node:stream/promises';
import type { CancellationLike } from './processRunner';

export interface DownloadProgress {
  receivedBytes: number;
  totalBytes?: number;
}

export interface DownloadOptions {
  cancellation?: CancellationLike;
  onProgress?: (progress: DownloadProgress) => void;
}

export async function downloadFile(url: string, destination: string, options: DownloadOptions = {}): Promise<void> {
  await mkdir(path.dirname(destination), { recursive: true });
  await rm(destination, { force: true });

  try {
    await downloadWithRedirects(url, destination, options, 0);
  } catch (error) {
    await rm(destination, { force: true });
    throw error;
  }
}

async function downloadWithRedirects(
  url: string,
  destination: string,
  options: DownloadOptions,
  redirectCount: number
): Promise<void> {
  if (redirectCount > 8) {
    throw new Error('Digital download exceeded the redirect limit.');
  }

  await new Promise<void>((resolve, reject) => {
    const request = https.get(
      url,
      {
        headers: {
          'User-Agent': 'SystemStudio-CIS310-VSCode/0.1.0',
          Accept: 'application/octet-stream'
        }
      },
      (response) => {
        const status = response.statusCode ?? 0;
        const location = response.headers.location;
        if (status >= 300 && status < 400 && location) {
          response.resume();
          downloadWithRedirects(new URL(location, url).toString(), destination, options, redirectCount + 1)
            .then(resolve, reject);
          return;
        }
        if (status !== 200) {
          response.resume();
          reject(new Error(`Digital download failed with HTTP ${status}.`));
          return;
        }

        const totalHeader = response.headers['content-length'];
        const totalBytes = typeof totalHeader === 'string' ? Number.parseInt(totalHeader, 10) : undefined;
        let receivedBytes = 0;
        response.on('data', (chunk: Buffer) => {
          receivedBytes += chunk.length;
          options.onProgress?.({
            receivedBytes,
            totalBytes: Number.isFinite(totalBytes) ? totalBytes : undefined
          });
        });

        const output = createWriteStream(destination, { flags: 'wx' });
        const cancellation = options.cancellation?.onCancellationRequested(() => {
          request.destroy(new Error('Digital download cancelled.'));
          response.destroy();
          output.destroy();
        });

        if (options.cancellation?.isCancellationRequested) {
          request.destroy(new Error('Digital download cancelled.'));
        }

        pipeline(response, output)
          .then(() => {
            cancellation?.dispose();
            resolve();
          })
          .catch((error: unknown) => {
            cancellation?.dispose();
            reject(error);
          });
      }
    );
    request.once('error', reject);
  });
}
