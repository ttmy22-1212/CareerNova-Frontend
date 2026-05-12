"use client";

import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { viVN } from "@mui/x-date-pickers/locales";
import { vi } from "date-fns/locale/vi";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LocalizationProvider
      dateAdapter={AdapterDateFns}
      adapterLocale={vi}
      localeText={
        viVN.components.MuiLocalizationProvider.defaultProps.localeText
      }
    >
      {children}
    </LocalizationProvider>
  );
}
