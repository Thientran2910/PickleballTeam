import { API_TIMEOUT_MS, API_URL } from '../config';
import { parseTeamPayload, type TeamData } from './schema';

const LOAD_ERROR = 'Không tải được dữ liệu. Vui lòng thử lại.';
const TIMEOUT_ERROR = 'Yêu cầu quá thời gian chờ. Vui lòng thử lại.';
const INVALID_DATA_ERROR = 'Dữ liệu nhận được không hợp lệ. Vui lòng thử lại.';

export async function fetchTeamData(signal?: AbortSignal): Promise<TeamData> {
  const controller = new AbortController();
  let timedOut = false;

  const abortFromCaller = () => controller.abort(signal?.reason);
  if (signal?.aborted) {
    abortFromCaller();
  } else {
    signal?.addEventListener('abort', abortFromCaller, { once: true });
  }

  const timeoutId = window.setTimeout(() => {
    timedOut = true;
    controller.abort(new DOMException('Request timed out', 'TimeoutError'));
  }, API_TIMEOUT_MS);

  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      credentials: 'omit',
      redirect: 'follow',
      cache: 'no-store',
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(LOAD_ERROR);
    }

    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      throw new Error(INVALID_DATA_ERROR);
    }

    try {
      return parseTeamPayload(payload);
    } catch {
      throw new Error(INVALID_DATA_ERROR);
    }
  } catch (error) {
    if (timedOut) {
      throw new Error(TIMEOUT_ERROR, { cause: error });
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
    signal?.removeEventListener('abort', abortFromCaller);
  }
}
