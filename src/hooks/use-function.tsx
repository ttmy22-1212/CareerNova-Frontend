"strict";
"use client";
/**
 * 16/09/2024
 * UPDATE: add option disableResetOnCall
 */
import { useState, useCallback, useRef } from "react";
import useAppSnackbar from "./use-app-snackbar";
import { get, set, del } from "idb-keyval";

const MAX_CACHED_ARRAY = 2000;
type ApiFunction<P, T> = (payload: P) => Promise<T>;

export interface UseFunctionOptions<P, T> {
  successMessage?: string;
  getErrorMessage?: (error: unknown) => string;
  hideSnackbarError?: boolean;
  disableSaving?: boolean;
  disableResetOnCall?: boolean;
  onSuccess?: ({ payload, result }: { payload: P; result: T }) => void;
  onError?: (error: any, payload?: any) => void;
  fixedPayload?: any;
  cacheKey?: string; // save response to localStorage and use if next request failed
}

export interface UseFunctionReturnType<P, T> {
  call: (payload: P) => Promise<{ data?: T; error?: string }>;
  loading: boolean;
  error: Error | null;
  data: T | undefined;
  setData: (_: T | undefined) => void;
  callCount: number;
}

export const DEFAULT_FUNCTION_RETURN: UseFunctionReturnType<any, any> = {
  call: async () => ({}),
  loading: false,
  error: null,
  data: undefined,
  setData: () => {},
  callCount: 0,
};

function useFunction<P, T>(
  apiFunction: ApiFunction<P, T>,
  options?: UseFunctionOptions<P, T>,
): UseFunctionReturnType<P, T> {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setStateData] = useState<T>();
  const callCountRef = useRef<number>(0);
  const { showSnackbarError, showSnackbarSuccess } = useAppSnackbar();

  const onRequestSuccess = useCallback(
    async (
      { payload, result }: { payload: P; result: T },
      option?: { noSave?: boolean },
    ) => {
      if (options?.successMessage) {
        showSnackbarSuccess(options?.successMessage);
      }
      if (!options?.disableSaving && !option?.noSave) {
        setStateData(result);
      }
      options?.onSuccess?.({
        payload,
        result,
      });
      if (options?.cacheKey) {
        await set(
          options.cacheKey,
          JSON.stringify(
            Array.isArray(result) ? result.slice(0, MAX_CACHED_ARRAY) : result,
          ),
        );
      }
      return { data: result };
    },
    [options, showSnackbarSuccess],
  );

  const call = useCallback(
    async (payload: P) => {
      setLoading(true);
      setError(null);

      if (!options?.disableResetOnCall) {
        setStateData(undefined);
      }
      try {
        callCountRef.current++;
        const callCount = callCountRef.current;
        const result = await apiFunction(
          options?.fixedPayload
            ? {
                ...payload,
                ...options?.fixedPayload,
              }
            : payload,
        );

        return await onRequestSuccess(
          { payload, result },
          {
            noSave: callCount != callCountRef.current,
          },
        );
      } catch (error) {
        if (options?.cacheKey) {
          const raw = await get(options.cacheKey);
          if (raw) {
            const result = JSON.parse(raw);

            return await onRequestSuccess({ payload, result });
          }
        }
        if (!options?.hideSnackbarError) {
          if (options?.getErrorMessage) {
            showSnackbarError(options.getErrorMessage(error));
          } else {
            if (error) {
              showSnackbarError(error);
            }
          }
        }
        setError(error as Error);
        options?.onError?.(error, payload);
        // errorLog(apiFunction.name || apiFunction.toString(), error, payload); // Call the errorLog function
        return { error: String(error) };
      } finally {
        setLoading(false);
      }
    },
    [apiFunction, onRequestSuccess, options, showSnackbarError],
  );

  const setData = useCallback(
    (data: T | undefined) => {
      if (options?.cacheKey) {
        if (data) {
          set(
            options.cacheKey,
            JSON.stringify(
              Array.isArray(data) ? data.slice(0, MAX_CACHED_ARRAY) : data,
            ),
          );
        } else {
          del(options.cacheKey);
        }
      }
      setStateData(data);
    },
    [options?.cacheKey],
  );

  return {
    call,
    loading,
    error,
    data,
    setData,
    callCount: callCountRef.current,
  };
}

export default useFunction;
