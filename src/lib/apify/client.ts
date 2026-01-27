import {
  ApifyRunResult,
  ApifyActorCallOptions,
  ApifyDatasetListOptions,
} from './types';

const APIFY_API_BASE = 'https://api.apify.com/v2';

class ApifyClient {
  private token: string;

  constructor(token?: string) {
    this.token = token || process.env.APIFY_API_TOKEN || '';
    if (!this.token) {
      console.warn('Apify API token not configured');
    }
  }

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.token}`,
    };
  }

  /**
   * Start an actor run
   */
  async runActor<TInput>(
    actorId: string,
    input: TInput,
    options: ApifyActorCallOptions = {}
  ): Promise<ApifyRunResult> {
    const { timeout = 300, memory = 1024, build } = options;

    const queryParams = new URLSearchParams({
      timeout: timeout.toString(),
      memory: memory.toString(),
    });

    if (build) {
      queryParams.set('build', build);
    }

    const url = `${APIFY_API_BASE}/acts/${actorId}/runs?${queryParams}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to start actor ${actorId}: ${error}`);
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Start an actor and wait for it to finish
   */
  async callActor<TInput, TOutput>(
    actorId: string,
    input: TInput,
    options: ApifyActorCallOptions = {}
  ): Promise<{ run: ApifyRunResult; items: TOutput[] }> {
    const { waitForFinish = 300 } = options;

    const queryParams = new URLSearchParams({
      waitForFinish: waitForFinish.toString(),
    });

    const url = `${APIFY_API_BASE}/acts/${actorId}/run-sync-get-dataset-items?${queryParams}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to call actor ${actorId}: ${error}`);
    }

    const items = await response.json();

    // Get run info from headers if available
    const runId = response.headers.get('x-apify-run-id') || '';
    const datasetId = response.headers.get('x-apify-default-dataset-id') || '';

    return {
      run: {
        id: runId,
        actId: actorId,
        status: 'SUCCEEDED',
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
        defaultDatasetId: datasetId,
        defaultKeyValueStoreId: '',
      },
      items,
    };
  }

  /**
   * Get the status of a run
   */
  async getRun(actorId: string, runId: string): Promise<ApifyRunResult> {
    const url = `${APIFY_API_BASE}/acts/${actorId}/runs/${runId}`;

    const response = await fetch(url, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get run status: ${error}`);
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Wait for a run to finish
   */
  async waitForRun(
    actorId: string,
    runId: string,
    timeoutMs: number = 300000,
    pollIntervalMs: number = 5000
  ): Promise<ApifyRunResult> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      const run = await this.getRun(actorId, runId);

      if (['SUCCEEDED', 'FAILED', 'ABORTED', 'TIMED-OUT'].includes(run.status)) {
        return run;
      }

      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    }

    throw new Error(`Run ${runId} timed out after ${timeoutMs}ms`);
  }

  /**
   * Get items from a dataset
   */
  async getDatasetItems<T>(
    datasetId: string,
    options: ApifyDatasetListOptions = {}
  ): Promise<T[]> {
    const { offset = 0, limit = 100, clean = true, fields } = options;

    const queryParams = new URLSearchParams({
      offset: offset.toString(),
      limit: limit.toString(),
      clean: clean.toString(),
    });

    if (fields) {
      queryParams.set('fields', fields.join(','));
    }

    const url = `${APIFY_API_BASE}/datasets/${datasetId}/items?${queryParams}`;

    const response = await fetch(url, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get dataset items: ${error}`);
    }

    return response.json();
  }

  /**
   * Abort a running actor
   */
  async abortRun(actorId: string, runId: string): Promise<void> {
    const url = `${APIFY_API_BASE}/acts/${actorId}/runs/${runId}/abort`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to abort run: ${error}`);
    }
  }
}

// Singleton instance
let clientInstance: ApifyClient | null = null;

export function getApifyClient(token?: string): ApifyClient {
  if (!clientInstance || token) {
    clientInstance = new ApifyClient(token);
  }
  return clientInstance;
}

export { ApifyClient };
