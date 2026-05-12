"use client";
import type { Direction, PaletteMode, Theme } from "@mui/material";
import {
  createTheme as createMuiTheme,
  responsiveFontSizes,
} from "@mui/material/styles";
import { createOptions as createBaseOptions } from "./base/create-options";
import { createOptions as createDarkOptions } from "./dark/create-options";
import { createOptions as createLightOptions } from "./light/create-options";
import { viVN } from "@mui/material/locale";
import { Layout, NavColor } from "@/types/settings";

declare module "@mui/material/styles" {
  export interface NeutralColors {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  }

  interface Palette {
    neutral: NeutralColors;
  }

  interface PaletteOptions {
    neutral?: NeutralColors;
  }

  interface PaletteColor {
    lightest?: string;
    darkest?: string;
    alpha4?: string;
    alpha8?: string;
    alpha12?: string;
    alpha30?: string;
    alpha50?: string;
    outlineBorder?: string;
    hovered?: string;
    "200"?: string;
  }

  interface TypeBackground {
    paper: string;
    "paper-tertiary": string;
    default: string;
  }

  interface TypeText {
    tertiary?: string;
  }
}

declare module "@mui/system" {
  interface BreakpointOverrides {
    xs: true;
    sm: true;
    md: true;
    lg: true;
    xl: true;
    xxl: true; // Add the new breakpoint here
  }
}

export type ColorPreset = "blue" | "green" | "indigo" | "purple";

export type Contrast = "normal" | "high";

interface ThemeConfig {
  colorPreset?: ColorPreset;
  contrast?: Contrast;
  direction?: Direction;
  layout?: Layout;
  navColor?: NavColor;
  paletteMode?: PaletteMode;
  responsiveFontSizes?: boolean;
  stretch?: boolean;
  breakpoints?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    xxl?: number;
  };
}

// const defaultBreakpoints = {
//   xs: 0,
//   sm: 600,
//   md: 900,
//   lg: 1200,
//   xl: 1560,
//   xxl: 1920,
// };

export const createTheme = (config: ThemeConfig): Theme => {
  let theme = createMuiTheme(
    // Base options available for both dark and light palette modes
    createBaseOptions({
      direction: config.direction,
    }),
    // Options based on selected palette mode, color preset, and contrast
    config.paletteMode === "dark"
      ? createDarkOptions({
          colorPreset: config.colorPreset,
          contrast: config.contrast,
        })
      : createLightOptions({
          colorPreset: config.colorPreset,
          contrast: config.contrast,
        }),
    viVN
  );

  if (config.responsiveFontSizes) {
    theme = responsiveFontSizes(theme);
  }

  return theme;
};

export const createLandingPageTheme = (config: ThemeConfig): Theme => {
  let theme = createMuiTheme(
    createBaseOptions({
      direction: config.direction,
    }),
    config.paletteMode === "dark"
      ? createDarkOptions({
          colorPreset: config.colorPreset,
          contrast: config.contrast,
        })
      : createLightOptions({
          colorPreset: config.colorPreset,
          contrast: config.contrast,
        }),
    viVN
  );

  if (config.breakpoints) {
    theme = createMuiTheme(theme, {
      breakpoints: {
        values: {
          xs: config.breakpoints.xs ?? theme.breakpoints.values.xs,
          sm: config.breakpoints.sm ?? theme.breakpoints.values.sm,
          md: config.breakpoints.md ?? theme.breakpoints.values.md,
          lg: config.breakpoints.lg ?? theme.breakpoints.values.lg,
          xl: config.breakpoints.xl ?? theme.breakpoints.values.xl,
          xxl: config.breakpoints.xxl ?? theme.breakpoints.values.xxl,
        },
      },
    });
  }

  if (config.responsiveFontSizes) {
    theme = responsiveFontSizes(theme);
  }

  return theme;
};

export const initialSettings: ThemeConfig = {
  colorPreset: "blue",
  contrast: "high",
  direction: "ltr",
  layout: "vertical",
  navColor: "evident",
  paletteMode: "light",
  responsiveFontSizes: true,
  stretch: false,
  breakpoints: {
    xs: 0,
    sm: 600,
    md: 900,
    lg: 1200,
    xl: 1560,
    xxl: 1920,
  },
};

const theme = createTheme(initialSettings);

export { theme };
