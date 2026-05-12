import { Box } from "@mui/material";
import type { FC } from "react";

interface CustomTableCellShadowProps {
  shadowLeft?: boolean;
  shadowRight?: boolean;
}

const CustomTableCellShadow: FC<CustomTableCellShadowProps> = ({
  shadowLeft,
  shadowRight,
}) => {
  return (
    <>
      {" "}
      {shadowRight && (
        <Box
          height="100%"
          position="absolute"
          right={-8}
          width={8}
          top={0}
          zIndex={1}
          sx={{
            background:
              "linear-gradient(to right, rgba(0, 0, 0, 0.1), transparent)",
          }}
        ></Box>
      )}
      {shadowLeft && (
        <Box
          height="100%"
          position="absolute"
          left={-8}
          width={8}
          top={0}
          zIndex={1}
          sx={{
            background:
              "linear-gradient(to left, rgba(0, 0, 0, 0.1), transparent)",
          }}
        ></Box>
      )}
    </>
  );
};

export default CustomTableCellShadow;
