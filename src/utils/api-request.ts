import CookieHelper from "./cookie-helper";
import { getErrorString } from "./obj-helper";

export const HOST = process.env.NEXT_PUBLIC_HOST;
export const API_HOST = process.env.NEXT_PUBLIC_HOST + "/api/v1";

export const getFormData = (data: { [name: string]: any }): FormData => {
  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    const value = data[key];
    if (Array.isArray(value)) {
      value.forEach((v) => formData.append(key, v));
    } else if (typeof value != "undefined") {
      formData.append(key, value);
    }
  });
  return formData;
};

export const removeUndefinedKeys = <T extends Record<string, any>>(
  obj: T,
): Partial<T> =>
  Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== "") acc[key as keyof T] = value;
    return acc;
  }, {} as Partial<T>);

const getRequestHeaders = async (
  method: string,
  isFormData?: boolean,
): Promise<any> => {
  const token = CookieHelper.getItem("token");

  const headers = new Headers();
  if (token) {
    headers.append("Authorization", "Bearer " + token);
  }
  if (!isFormData) {
    headers.append("Content-Type", "application/json");
  }
  headers.append("ngrok-skip-browser-warning", "true");
  return headers;
};

// Parse response date time
const dateFormat =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
function reviver(key: any, value: any) {
  if (typeof value === "string" && dateFormat.test(value)) {
    return new Date(value);
  }

  return value;
}

// Attach body as search params
const getRequestUrl = (query: string, body?: any) => {
  return (
    (query.startsWith("http") ? "" : API_HOST) +
    query +
    (body ? "?" + new URLSearchParams(body) : "")
  );
};

const apiFetch = async (
  input: RequestInfo | URL,
  init?: RequestInit | undefined,
) => {
  try {
    const response = await fetch(input, init);
    if (!response.ok || response.status / 100 >= 4) {
      let result: any = await response.text();
      try {
        result = JSON.parse(result);
      } catch (error) {}
      const message = `Lỗi: ${getErrorString(
        typeof result == "string" ? result : result.message || response.status,
      )}`;
      throw new Error(message);
    }
    const text = await response.text();
    window.dispatchEvent(new Event("online"));
    return JSON.parse(text, reviver);
  } catch (error) {
    if (typeof window != "undefined") {
      if (String(error).includes("Failed to fetch")) {
        window.dispatchEvent(new Event("offline"));
      } else {
        window.dispatchEvent(new Event("online"));
      }
    }
    throw getErrorString(error);
  }
};

export const apiPost = async (query: string, body: any) => {
  const isFormData = body instanceof FormData;
  const headers = await getRequestHeaders("POST", isFormData);
  return await apiFetch(getRequestUrl(query), {
    method: "POST",
    headers,
    body: isFormData ? body : JSON.stringify(body),
  });
};

export const apiDelete = async (query: string, body: any) => {
  const isFormData = body instanceof FormData;
  const headers = await getRequestHeaders("DELETE", isFormData);
  return await apiFetch(getRequestUrl(query), {
    method: "DELETE",
    headers,
    body: isFormData ? body : JSON.stringify(body),
  });
};

export const apiPut = async (query: string, body: any) => {
  const isFormData = body instanceof FormData;
  const headers = await getRequestHeaders("PUT", isFormData);
  return await apiFetch(getRequestUrl(query), {
    method: "PUT",
    headers,
    body: isFormData ? body : JSON.stringify(body),
  });
};

export const apiPatch = async (query: string, body: any) => {
  const isFormData = body instanceof FormData;
  const headers = await getRequestHeaders("PATCH", isFormData);
  return await apiFetch(getRequestUrl(query), {
    method: "PATCH",
    headers,
    body: isFormData ? body : JSON.stringify(body),
  });
};

export const apiGet = async (query: string, body?: any) => {
  const headers = await getRequestHeaders("GET");
  return await apiFetch(getRequestUrl(query, body), {
    method: "GET",
    headers,
  });
};
