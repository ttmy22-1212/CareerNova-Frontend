import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid2,
  IconButton,
  Stack,
  TextField,
  Theme,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { Refresh } from "iconsax-react";
import MultipleSelectOptionDialogItem from "./multiple-select-option-dialog-item";
import { OptionsWithChildren, getAllChildrenValues } from "./type";
import { useCallback, useEffect, useState } from "react";
import { Clear } from "@mui/icons-material";

interface MultipleSelectDialogProps {
  option?: OptionsWithChildren | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (value?: string[]) => void;
  value: string[];
}

const MultipleSelectDialog = ({
  open,
  onClose,
  onSubmit,
  option,
  value,
}: MultipleSelectDialogProps) => {
  const [valueToUpdate, setValueToUpdate] = useState<string[]>();
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up("sm"));
  const [searchText, setSearchText] = useState("");

  const handleSubmit = useCallback(() => {
    onSubmit(valueToUpdate);
    onClose();
  }, [onClose, onSubmit, valueToUpdate]);

  const handleReset = useCallback(() => {
    if (option) {
      // Get all child values of the current option
      const childrenValues = getAllChildrenValues(option);

      // Filter out values not related to the current option and its children
      const otherValues = value.filter(
        (v) => v !== option.value && !childrenValues.includes(v),
      );

      // Set value to include only unrelated values and the current root option
      setValueToUpdate([...otherValues, option.value]);
    }
  }, [option, value]);

  const handleCancel = useCallback(() => {
    setValueToUpdate(value);
    onClose();
  }, [onClose, value]);

  useEffect(() => {
    setValueToUpdate(value);
  }, [value, open]);

  return (
    <Dialog
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      open={open}
      PaperProps={{
        sx: {
          height: !smUp ? "500px" : "600px",
        },
      }}
    >
      <DialogTitle>
        <Stack position={"relative"}>
          <Typography variant="subtitle1" fontWeight={600}>
            Chọn danh mục con
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Danh mục: {option?.label}
          </Typography>
          <IconButton
            sx={{ position: "absolute", top: 0, right: 0 }}
            onClick={handleCancel}
          >
            <Clear />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent
        sx={{
          px: 2,
          pb: 2,
        }}
      >
        <TextField
          sx={{ marginTop: "8px" }}
          fullWidth
          label="Tìm kiếm"
          placeholder="Tìm kiếm danh mục con"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        ></TextField>
        <Grid2 container mt={1} spacing={1}>
          {option?.children
            ?.filter((item) =>
              item.label
                .toLowerCase()
                .includes(searchText.trim().toLowerCase()),
            )
            .map((item) => (
              <Grid2 key={item.value} size={{ xs: 12, sm: 6, md: 4 }}>
                <MultipleSelectOptionDialogItem
                  option={item}
                  value={valueToUpdate}
                  onChange={setValueToUpdate}
                />
              </Grid2>
            ))}
        </Grid2>
      </DialogContent>
      <DialogActions>
        <Button
          size="small"
          fullWidth={!smUp}
          variant="outlined"
          color="inherit"
          startIcon={smUp ? <Refresh variant="Linear" /> : null}
          onClick={handleReset}
        >
          Thiết lập lại
        </Button>
        {smUp && (
          <Button color="error" variant="contained" onClick={handleCancel}>
            Huỷ bỏ
          </Button>
        )}
        <Button
          size="small"
          variant="contained"
          onClick={handleSubmit}
          fullWidth={!smUp}
        >
          Áp dụng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MultipleSelectDialog;
