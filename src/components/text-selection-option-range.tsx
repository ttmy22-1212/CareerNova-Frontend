import {
  Button,
  Divider,
  FormControl,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useTheme,
  Theme,
  useMediaQuery,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SingleSelectOptionProps } from "./single-select-option";
import { useDialog } from "@/hooks/use-dialog";
import CloseIcon from "@mui/icons-material/Close";
import { neutral } from "@/theme/colors";
import { alpha } from "@mui/material/styles";
import { CustomFilterItemConfig } from "./custom-filter";
import RowStack from "./row-stack";
import { formatNumberEng } from "@/utils/format-number";

export interface TextSelectionOptionRangeProps<T> {
  filter: Partial<T>;
  onChange: (filter: Partial<T>) => void;
  config: CustomFilterItemConfig<T>;
}

function TextSelectionOptionRange<T>({
  filter,
  config,
  onChange,
}: TextSelectionOptionRangeProps<T>) {
  const theme = useTheme();
  const isMd = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
  const revenueDialog = useDialog();

  const [dialogValue, setDialogValue] = useState(filter[config.key] || null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [from, setFrom] = useState<number>();
  const [to, setTo] = useState<number>();

  const handleAcceptFilter = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();

      onChange({
        ...filter,
        [config.key]: [from, to],
      });
      setMenuOpen(false);
      revenueDialog.handleClose();
    },
    [from, to, onChange, filter, config.key, revenueDialog],
  );

  const handleRangeChipClick = useCallback(
    (key: keyof T, value: number[]) => {
      const [_from, _to] = value;
      setFrom(_from);
      setTo(_to);
      onChange({
        ...filter,
        [config.key]: value,
      });
      setMenuOpen(false);
    },
    [config.key, filter, onChange],
  );

  const handleChangeDialogValue = useCallback((value: any) => {
    const [_from, _to] = value;
    setDialogValue(value);
    setFrom(_from);
    setTo(_to);
  }, []);

  const handleCloseDialog = useCallback(() => {
    revenueDialog.handleClose();
    setDialogValue(filter[config.key] || null);
  }, [revenueDialog, filter, config]);

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
        value={filter[config.key]?.toString() || ""}
        InputProps={{
          startAdornment: config.icon && (
            <InputAdornment position="start">{config.icon}</InputAdornment>
          ),
          slotProps: {
            input: {
              placeholder: "asdfasdf",
              sx: {
                "& .MuiTypography-root": {
                  padding: 0,
                },
              },
            },
          },
        }}
        SelectProps={{
          value: filter[config.key]?.toString() || "",
          displayEmpty: true,
          renderValue: (_value: any) => {
            if (!_value) {
              return <>{config.ComponentProps?.placeholder || ""}</>;
            }
            const value = filter[config.key];
            if (Array.isArray(value)) {
              let label = config.options?.find(
                (o) => value[0] === o.value[0] && value[1] === o.value[1],
              )?.label;
              if (!label) {
                if (config.getCustomValueLabel) {
                  label = config.getCustomValueLabel?.(value);
                } else if (typeof value[0] == "number") {
                  label = value
                    .map((v) => (v ? formatNumberEng(v, 1) : ""))
                    .join(" - ");
                } else {
                  label = value.join(" - ");
                }
              }
              return <>{label}</>;
            }
          },
          open: menuOpen,
          onOpen: () =>
            !isMd ? setMenuOpen(true) : revenueDialog.handleOpen(),
          onClose: () =>
            !isMd ? setMenuOpen(false) : revenueDialog.handleClose(),
          MenuProps: {
            slotProps: {
              paper: {
                sx: {
                  maxWidth: "200px",
                },
              },
            },
          },
        }}
      >
        {config.options?.map((option) => (
          <MenuItem
            key={option.value.toString()}
            value={option.value.toString()}
            onClick={() => {
              handleRangeChipClick(config.key, option.value);
            }}
          >
            <Typography
              fontSize={"14px"}
              fontWeight={500}
              color={"text.primary"}
              sx={{ padding: "6px 6px" }}
            >
              {option.label}
            </Typography>
          </MenuItem>
        ))}
        {!config.hiddenFillRangeValueAction && <Divider />}
        {!config.hiddenFillRangeValueAction && (
          <Stack
            padding={"12px"}
            gap={"12px"}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleAcceptFilter}>
              <Stack gap={2}>
                <Stack flexDirection="row" gap={"12px"} alignItems="center">
                  <TextField
                    placeholder="Từ"
                    variant="outlined"
                    onChange={(e) =>
                      setFrom(Number(e.target.value.replaceAll(/[^0-9]/g, "")))
                    }
                    value={from?.toLocaleString()}
                    type="string"
                  />
                  <Typography sx={{ marginTop: 1, marginBottom: 1 }}>
                    {" "}
                    -{" "}
                  </Typography>
                  <TextField
                    placeholder="Đến"
                    variant="outlined"
                    onChange={(e) =>
                      setTo(Number(e.target.value.replaceAll(/[^0-9]/g, "")))
                    }
                    value={to?.toLocaleString()}
                    type="string"
                  />
                </Stack>
                <Button
                  variant="contained"
                  sx={{ alignSelf: "end", width: "fit-content" }}
                  type="submit"
                >
                  Xác nhận
                </Button>
              </Stack>
            </form>
          </Stack>
        )}
      </TextField>
      <Dialog
        open={revenueDialog.open}
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
              {config.label}
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
                color="primary"
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
                        color: "primary",
                        width: "100%",
                      }
                    : {
                        color: "inherit",
                        width: "100%",
                        borderColor: alpha(neutral[500], 0.5),
                      }
                }
              >
                {option.label}
              </Button>
            ))}

            {!config.hiddenFillRangeValueAction && (
              <Stack gap={"12px"} onKeyDown={(e) => e.stopPropagation()}>
                <Stack gap={2}>
                  <Stack flexDirection="row" gap={"12px"} alignItems="center">
                    <TextField
                      placeholder="Tối thiểu"
                      variant="outlined"
                      onChange={(e) =>
                        setFrom(
                          Number(e.target.value.replaceAll(/[^0-9]/g, "")),
                        )
                      }
                      value={from ? from?.toLocaleString("vi-VN") : ""}
                      type="string"
                    />
                    <Typography sx={{ marginTop: 1, marginBottom: 1 }}>
                      {" "}
                      -{" "}
                    </Typography>
                    <TextField
                      placeholder="Tối đa"
                      variant="outlined"
                      onChange={(e) =>
                        setTo(Number(e.target.value.replaceAll(/[^0-9]/g, "")))
                      }
                      value={to ? to?.toLocaleString("vi-VN") : ""}
                      type="string"
                    />
                  </Stack>
                </Stack>
              </Stack>
            )}
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
            sx={{ color: "error.main", borderColor: "error.main" }}
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

export default TextSelectionOptionRange;
