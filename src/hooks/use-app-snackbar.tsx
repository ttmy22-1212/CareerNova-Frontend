import { useSnackbar } from "notistack";
import { useCallback, useMemo } from "react";
import { getErrorString } from "@/utils/obj-helper";

function useAppSnackbar() {
  const { enqueueSnackbar } = useSnackbar();

  const showSnackbarError = useCallback(
    (error: any) => {
      enqueueSnackbar(getErrorString(error), {
        variant: "error",
        style: { whiteSpace: "pre" },
      });
    },
    [enqueueSnackbar]
  );

  const showSnackbarSuccess = useCallback(
    (successString: any) => {
      enqueueSnackbar(getErrorString(successString), {
        variant: "success",
        style: { whiteSpace: "pre" },
      });
    },
    [enqueueSnackbar]
  );

  return useMemo(
    () => ({
      showSnackbarError,
      showSnackbarSuccess,
    }),
    [showSnackbarError, showSnackbarSuccess]
  );
}

export default useAppSnackbar;
