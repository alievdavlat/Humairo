import * as Sentry from "@sentry/react";
const raw = import.meta.env.VITE_API_URL;
const base = typeof raw === "string" ? raw.replace(/\/+$/, "") : "";

export async function apiFetch(path, options = {}) {
  const { getToken, method = "GET", body } = options;

  const headers = { "Content-Type": "application/json" };
  const token = getToken ? await getToken() : null;
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${base}${path}`, {
      method,
      headers,
      body: body != undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    Sentry.addBreadcrumb({
      category: "api",
      message: `${method} ${path}`,
      level: "error",
      data: { network: true },
    });
    Sentry.captureException(err, {
      tags: { "api.fetch": "network" },
      extra: { path, method },
    });
    console.error(err);
    throw err;
  }

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  Sentry.addBreadcrumb({
    category: "api",
    message: `${method} ${path}`,
    level: res.ok ? "info" : "warning",
    data: { status: res.status },
  });

  if (!res.ok) {
    const msg =
      typeof data?.message === "string" ? data.message : res.statusText;
    const err = new Error(typeof msg === "string" ? msg : "Request failed");
    if (res.status >= 500) {
      Sentry.captureException(err, {
        tags: { "api.fetch": "http", "http.status": String(res.status) },
        extra: { path, method, status: res.status },
      });
    }
    throw err;
  }

  return data;
}
