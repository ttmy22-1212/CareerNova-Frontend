import { useDrag } from "@/hooks/use-drag";
import { useDebounce } from "@/hooks/use_debounce";
import { Box, Stack, TableCell, TableCellProps } from "@mui/material";
import {
  MouseEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

export const CardTableResizableCell = ({
  log,
  onResized,
  forceAuto,
  disableResize,
  ...props
}: TableCellProps & {
  log?: boolean;
  onResized?: () => void;
  forceAuto?: boolean;
  disableResize?: boolean;
}) => {
  const ref = useRef<HTMLElement | null>(null);
  const originWidth = useRef<number | null>(null);
  const [width, setWidth] = useState<number>();
  const debouncedWidth = useDebounce(width, 200);

  const { position, isDragging, dragHandlers } = useDrag();

  useEffect(() => {
    window.addEventListener("mousemove", dragHandlers.onMouseMove);
    return () =>
      window.removeEventListener("mousemove", dragHandlers.onMouseMove);
  }, [dragHandlers.onMouseMove]);

  useEffect(() => {
    window.addEventListener("mouseup", dragHandlers.onMouseUp);
    return () => window.removeEventListener("mouseup", dragHandlers.onMouseUp);
  }, [dragHandlers.onMouseUp]);

  const handleMouseDown = useCallback<MouseEventHandler>(
    (e) => {
      if (ref.current) {
        originWidth.current = ref.current.getBoundingClientRect().width;
        dragHandlers.onMouseDown(e);
      }
    },
    [dragHandlers]
  );

  useEffect(() => {
    onResized?.();
  }, [debouncedWidth, onResized]);

  useEffect(() => {
    if (isDragging) {
      document.body.style.cursor = "col-resize";
    } else {
      document.body.style.cursor = "default";
    }
  }, [isDragging]);

  useEffect(() => {
    if (ref.current) {
      setWidth(Math.max(40, (originWidth.current || 0) + position.x));
    }
  }, [position]);

  useEffect(() => {
    if (ref.current) {
      originWidth.current = ref.current.getBoundingClientRect().width;
      setWidth(originWidth.current);
    }
  }, [props.children]);

  return (
    <TableCell
      ref={ref}
      width={width || "auto"}
      {...props}
      sx={{
        px: 2,
        overflow: "visible",
        position: "relative",
        ...props.sx,
      }}
    >
      {props.children}
      {!disableResize && (
        <Box
          sx={{
            width: 16,
            borderColor: "divider",
            height: "100%",
            position: "absolute",
            top: 0,
            right: -8,
            cursor: "col-resize",
            px: isDragging ? "6px" : "8px",
            py: 1,
            zIndex: 1,
            "&:hover": {
              px: "6px",
              "& > div": {
                bgcolor: "neutral.500",
              },
            },
          }}
          onMouseDown={handleMouseDown}
        >
          <Stack
            sx={{
              bgcolor: isDragging ? "neutral.500" : "neutral.400",
              borderRadius: 2,
              height: "100%",
              width: "100%",
            }}
          ></Stack>
        </Box>
      )}
    </TableCell>
  );
};
