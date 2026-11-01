// Talking to the server. Every error becomes a plain-English message the panel can show.

const API = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
export const apiBase = API;

export class ApiError extends Error {
  constructor(message, { status, details, code } = {}) {
    super(message);
    this.status = status;
    this.details = details || null;
    this.code = code || null;
  }
}

let onSignedOut = () => {};
export const setSignedOutHandler = (fn) => { onSignedOut = fn; };

export async function api(path, { method = 'GET', body, signal } = {}) {
  let res;
  try {
    res = await fetch(`${API}/api${path}`, {
      method,
      credentials: 'include',
      signal,
      headers: body instanceof FormData ? { 'X-Requested-With': 'fetch' } : { 'Content-Type': 'application/json', 'X-Requested-With': 'fetch' },
      body: body === undefined || body instanceof FormData ? body : JSON.stringify(body),
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError('Can’t reach the server. Check your internet connection and try again. (If the server was asleep it may take up to a minute to wake up.)', { status: 0 });
  }
  let data = null;
  const text = await res.text();
  try { data = text ? JSON.parse(text) : null; } catch { data = null; }
  if (!res.ok) {
    if (res.status === 401 && !path.startsWith('/auth/login')) onSignedOut();
    throw new ApiError(data?.error || `Something went wrong (error ${res.status}). Please try again.`, { status: res.status, details: data?.details, code: data?.code });
  }
  return data;
}

/**
 * Upload photos with a progress bar (fetch can't report upload progress, so XHR is used).
 * Calls onProgress(0..1). Resolves with the server's { items, failed }.
 */
export function uploadFiles(files, { onProgress, alt } = {}) {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    files.forEach((f) => form.append('files', f, f.name));
    if (alt) form.append('alt', alt);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API}/api/admin/media`);
    xhr.withCredentials = true;
    xhr.setRequestHeader('X-Requested-With', 'fetch');
    xhr.upload.onprogress = (e) => { if (e.lengthComputable) onProgress?.(e.loaded / e.total); };
    xhr.onload = () => {
      let data = null;
      try { data = JSON.parse(xhr.responseText); } catch { /* not JSON */ }
      if (xhr.status === 401) onSignedOut();
      if (xhr.status >= 200 && xhr.status < 300) resolve(data);
      else if (data?.failed?.length) resolve(data);
      else reject(new ApiError(data?.error || `Upload failed (error ${xhr.status}). Please try again.`, { status: xhr.status }));
    };
    xhr.onerror = () => reject(new ApiError('The upload was interrupted. Check your internet connection and try again.', { status: 0 }));
    xhr.ontimeout = () => reject(new ApiError('The upload took too long. Try fewer photos at once.', { status: 0 }));
    xhr.timeout = 10 * 60_000;
    xhr.send(form);
  });
}
