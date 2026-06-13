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

// Bộ nhớ đệm toàn cục điều phối hàng đợi ở FE
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

const apiFetch = async (
  input: RequestInfo | URL,
  init?: RequestInit | undefined,
  responseType: "json" | "blob" = "json",
): Promise<any> => {
  try {
    let response = await fetch(input, init);

    // Phát hiện lỗi 401 (Hết hạn 2 phút)
    if (response.status === 401) {
      // Nếu request này ĐANG LÀ API REFRESH TOKEN mà vẫn thối 401 -> Refresh token chết hẳn (quá 7 ngày)
      if (String(input).includes("/auth/refresh")) {
        CookieHelper.removeItem("token");
        CookieHelper.removeItem("refresh_token");
        if (typeof window !== "undefined") window.location.href = "/login";
        throw new Error("Phiên đăng nhập đã hết hạn.");
      }

      const refreshToken = CookieHelper.getItem("refresh_token");
      if (!refreshToken || typeof refreshToken !== "string") {
        throw new Error("Không tìm thấy Refresh Token");
      }

      // NẾU ĐANG CÓ REQUEST KHÁC ĐI REFRESH: Treo request này lại, nhét vào hàng đợi xếp hàng
      // NẾU ĐANG CÓ REQUEST KHÁC ĐI REFRESH: Treo request này lại, nhét vào hàng đợi xếp hàng
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (newToken: string) => {
              // Khởi tạo headers an toàn nếu init hoặc init.headers chưa tồn tại
              const newInit = { ...init };
              const headersObj = new Headers(newInit.headers || {});
              headersObj.set("Authorization", "Bearer " + newToken);
              newInit.headers = headersObj;

              resolve(apiFetch(input, newInit, responseType)); // Chạy lại API ban đầu với token mới
            },
            reject: (err: any) => reject(err),
          });
        });
      }

      // REQUEST ĐẦU TIÊN TIÊN PHONG: Khóa chốt và đi lấy token mới
      isRefreshing = true;

      try {
        const refreshResponse = await fetch(`${API_HOST}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (refreshResponse.ok) {
          const resData = JSON.parse(await refreshResponse.text());
          const data = resData.data || resData;
          const { access_token, refresh_token: newRefreshToken } = data;

          CookieHelper.setItem("token", access_token);
          if (newRefreshToken)
            CookieHelper.setItem("refresh_token", newRefreshToken);

          // Giải phóng hàng đợi cho các request đang xếp hàng gõ cửa
          processQueue(null, access_token);
          isRefreshing = false;

          // Chạy lại chính request tiên phong này một cách an toàn
          const newInit = { ...init };
          const headersObj = new Headers(newInit.headers || {});
          headersObj.set("Authorization", "Bearer " + access_token);
          newInit.headers = headersObj;

          return await apiFetch(input, newInit, responseType);
        } else {
          throw new Error("Refresh token invalid");
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        CookieHelper.removeItem("token");
        CookieHelper.removeItem("refresh_token");
        if (typeof window !== "undefined") window.location.href = "/login";
        throw refreshError;
      }
    }

    // Xử lý các lỗi thông thường khác ngoài 401
    if (!response.ok) {
      let result: any;
      try {
        result = JSON.parse(await response.text());
      } catch (e) {
        result = response.statusText || response.status;
      }
      throw new Error(
        `Lỗi: ${getErrorString(typeof result === "string" ? result : result.message || response.status)}`,
      );
    }

    if (typeof window !== "undefined")
      window.dispatchEvent(new Event("online"));

    if (responseType === "blob") {
      return await response.blob();
    }

    const text = await response.text();
    return JSON.parse(text, reviver);
  } catch (error) {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new Event(
          String(error).includes("Failed to fetch") ? "offline" : "online",
        ),
      );
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

export const apiGetBlob = async (query: string, body?: any) => {
  const headers = await getRequestHeaders("GET");
  return await apiFetch(
    getRequestUrl(query, body),
    {
      method: "GET",
      headers,
    },
    "blob",
  );
};
