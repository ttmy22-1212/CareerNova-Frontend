import SimpleBar from "simplebar-react";
import { styled } from "@mui/material/styles";
import { ComponentProps } from "react";
import "simplebar-react/dist/simplebar.min.css";

export const Scrollbar = styled(SimpleBar)`
  .simplebar-track.simplebar-vertical {
    top: 0;
    width: 14px;
    pointer-events: default;
  }
  .simplebar-track.simplebar-horizontal {
    left: 0;
    height: 14px;
    pointer-events: default;
  }
`;
export type ScrollbarProps = ComponentProps<typeof Scrollbar>;
