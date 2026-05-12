import {
  Checkbox,
  Collapse,
  IconButton,
  Stack,
  Typography,
  ClickAwayListener,
  FormControl,
  FormControlLabel,
  Box,
} from "@mui/material";
import React, { useCallback, useRef, useState } from "react";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { OptionsWithChildren } from "./type";
import { Scrollbar } from "../scrollbar";

interface MultipleSelectOptionDialogItemProps {
  option: OptionsWithChildren;
  value?: string[];
  onChange: (value: string[]) => void;
}

const MultipleSelectOptionDialogItem = ({
  option,
  value,
  onChange,
}: MultipleSelectOptionDialogItemProps) => {
  const [openCollapse, setOpenCollapse] = useState(false);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
      const newValue = (value || []).filter((v) => v != event.target.value);
      if (checked) {
        newValue.push(event.target.value);
      }
      onChange(newValue);
      event.stopPropagation(); // Stop event propagation to prevent ClickAwayListener from triggering
    },
    [onChange, value],
  );

  const handleClickAway = useCallback(
    (event: MouseEvent | TouchEvent) => {
      // Only close if the click target isn't inside the Collapse component
      const collapseElement = document.querySelector(
        '[data-collapse-container="true"]',
      );
      if (
        openCollapse &&
        collapseElement &&
        !collapseElement.contains(event.target as Node)
      ) {
        setOpenCollapse(false);
      }
    },
    [openCollapse],
  );

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Stack
        sx={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: "14px",
          borderBottomLeftRadius: openCollapse ? 0 : "14px",
          borderBottomRightRadius: openCollapse ? 0 : "14px",
          border: 1,
          borderColor: "divider",
          position: "relative",
          ...(openCollapse
            ? {
                bgcolor: "primary.lightest",
                borderColor: "primary.main",
                zIndex: 1300, // Ensure parent has a high z-index
              }
            : {}),
        }}
      >
        <Stack direction="row" justifyContent="space-between">
          <FormControl sx={{ flex: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  value={option.value}
                  checked={value?.includes(option.value)}
                  onChange={handleChange}
                />
              }
              label={<Typography variant="body2">{option.label}</Typography>}
            />
          </FormControl>
          {option.children && option.children?.length > 0 && (
            <IconButton onClick={() => setOpenCollapse(!openCollapse)}>
              <ChevronRightIcon />
            </IconButton>
          )}
        </Stack>

        <Collapse
          in={openCollapse}
          sx={{
            overflowY: "auto",
            width: "calc(100% + 4px)",
            position: "absolute",
            top: "100%",
            left: -2,
            zIndex: 1400, // Higher than parent
            bgcolor: "primary.lightest",
            border: 1,
            borderColor: "primary.main",
            borderRadius: "14px",
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            boxShadow: openCollapse ? 1 : 0,
            pointerEvents: "auto", // Make sure the collapse can receive pointer events
          }}
        >
          <Scrollbar sx={{ maxHeight: "20vh", px: 2 }}>
            {option.children?.map((item) => (
              <Stack key={item.value}>
                <FormControlLabel
                  control={
                    <Checkbox
                      value={item.value}
                      checked={value?.includes(item.value)}
                      onChange={handleChange}
                    />
                  }
                  label={item.label}
                />
              </Stack>
            ))}
          </Scrollbar>
        </Collapse>
      </Stack>
    </ClickAwayListener>
  );
};

export default MultipleSelectOptionDialogItem;
