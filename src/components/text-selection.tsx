import {
  FormControl,
  InputAdornment,
  MenuItem,
  TextField,
  Typography,
  Theme,
  useMediaQuery,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  useTheme,
  Stack,
  Button,
} from "@mui/material";
import { useState, useEffect } from "react";
import { ChangeEventHandler, useCallback } from "react";
import { SingleSelectOptionProps } from "./single-select-option";
import { useDialog } from "@/hooks/use-dialog";
import CloseIcon from "@mui/icons-material/Close";
import { neutral } from "@/theme/colors";
import { alpha } from "@mui/material/styles";
import React from "react";
import RowStack from "./row-stack";

function TextSelection<T>({
  filter,
  config,
  onChange,
}: SingleSelectOptionProps<T>) {
  const theme = useTheme();
  const isMd = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
  const dialog = useDialog();

  const [dialogValue, setDialogValue] = useState(filter[config.key] || null);
  const [menuOpen, setMenuOpen] = useState(false);
  const handleAcceptFilter = useCallback(() => {
    onChange({
      ...filter,
      [config.key]: dialogValue,
    });
    dialog.handleClose();
  }, [onChange, filter, config.key, dialog, dialogValue]);

  const handleChangeDialogValue = useCallback((value: any) => {
    setDialogValue(value);
  }, []);

  const handleCloseDialog = useCallback(() => {
    dialog.handleClose();
    setDialogValue(filter[config.key] || null);
  }, [dialog, filter, config]);

  const handleChange: ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  > = useCallback(
    (e) => {
      onChange({ ...filter, [config.key]: e.target.value });
    },
    [config.key, filter, onChange],
  );

  useEffect(() => {
    setDialogValue(filter[config.key] || null);
  }, [filter, config]);

  return (
    <FormControl
      sx={{
        backgroundColor: "white",
        borderRadius: 1,
        width: "100%",
      }}
    >
      <TextField
        select
        label={config.label}
        value={filter[config.key] || ""}
        onChange={handleChange}
        InputProps={{
          startAdornment: config.icon && (
            <InputAdornment position="start">{config.icon}</InputAdornment>
          ),
          slotProps: {
            input: {
              sx: {
                "& .MuiTypography-root": {
                  padding: 0,
                },
              },
            },
          },
        }}
        SelectProps={{
          value: filter[config.key] || null,
          open: menuOpen,
          onOpen: () => (!isMd ? setMenuOpen(true) : dialog.handleOpen()),
          onClose: () => (!isMd ? setMenuOpen(false) : dialog.handleClose()),
          displayEmpty: true,
          MenuProps: {
            slotProps: {
              paper: {
                sx: {
                  maxWidth: "200px",
                },
              },
            },
          },
          renderValue: (_value: any) => {
            if (!_value) {
              return <>{config.ComponentProps?.placeholder || ""}</>;
            }
            const option = config.options?.find((o) => o.value == _value);
            return option?.label || "";
          },
        }}
      >
        {config.options?.map((option) => (
          <MenuItem key={option.value.toString()} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
      <Dialog
        open={dialog.open}
        onClose={handleCloseDialog}
        PaperProps={{
          style: {
            minWidth: "328px",
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: theme.palette.secondary.lightest,
          }}
        >
          <RowStack justifyContent={"space-between"}>
            <Typography variant="h6" color="text.primary">
              {config?.label}
            </Typography>
            <IconButton aria-label="close" onClick={handleCloseDialog}>
              <CloseIcon />
            </IconButton>
          </RowStack>
        </DialogTitle>
        <DialogContent
          sx={{
            paddingX: 2.5,

            paddingBottom: 2,
          }}
          style={{ paddingTop: "16px" }}
        >
          <Stack gap={1}>
            {config.options?.map((option) => (
              <Button
                key={option.value.toString()}
                onClick={() => {
                  handleChangeDialogValue(option.value);
                }}
                variant={
                  dialogValue?.toString() == option.value.toString()
                    ? "contained"
                    : "outlined"
                }
                sx={
                  dialogValue?.toString() == option.value.toString()
                    ? {
                        width: "100%",
                      }
                    : {
                        color: "text.primary",
                        width: "100%",
                        borderColor: alpha(neutral[500], 0.5),
                      }
                }
              >
                {option.label}
              </Button>
            ))}
          </Stack>
        </DialogContent>
        {/* <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAcceptFilter();
          }}
        > */}
        <DialogActions
          sx={{
            backgroundColor: theme.palette.secondary.lightest,
          }}
        >
          <Button
            type="button"
            variant="outlined"
            color="error"
            onClick={handleCloseDialog}
          >
            Huỷ bỏ
          </Button>
          <Button onClick={handleAcceptFilter} variant="contained">
            Xác nhận
          </Button>
        </DialogActions>
        {/* </form> */}
      </Dialog>
    </FormControl>
  );
}

export default TextSelection;
