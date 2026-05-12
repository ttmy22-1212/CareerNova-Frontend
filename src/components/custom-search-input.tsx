import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  Stack,
  SxProps,
  TextField,
  TextFieldProps,
  Theme,
  useMediaQuery,
} from "@mui/material";
import React, { useCallback, useState } from "react";
import RowStack from "./row-stack";

interface CustomSearchInputProps {
  onSearch: (value: string) => void;
  initialSearchValue?: string;
  textFieldProps?: TextFieldProps;
  sx?: SxProps;
}

const CustomSearchInput = ({
  onSearch,
  initialSearchValue = "",
  textFieldProps,
  ...sx
}: CustomSearchInputProps) => {
  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("md"),
  );
  const [searchValue, setSearchValue] = useState(initialSearchValue);

  const handleChangeValue = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchValue(e.target.value);
    },
    [],
  );

  const handleSubmitForm = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      onSearch(searchValue.trim());
    },
    [onSearch, searchValue],
  );

  return (
    <Stack
      component="form"
      onSubmit={handleSubmitForm}
      gap={1}
      alignItems="flex-end"
      sx={{
        maxWidth: "1200px",
        overflow: "hidden",
        borderRadius: 1.5,
        border: 1,
        borderColor: "primary.main",
        ...sx,
      }}
    >
      <RowStack alignItems="stretch" width={"100%"}>
        <TextField
          fullWidth
          value={searchValue}
          onChange={handleChangeValue}
          variant={"outlined"}
          placeholder="Nhập từ khoá tìm kiếm..."
          sx={{
            "& .MuiOutlinedInput-root": {
              height: "100%",
              minHeight: "40px",
              "& fieldset": {
                border: "none",
              },
              "&.Mui-focused fieldset": {
                borderColor: "transparent !important",
                boxShadow: "none !important",
              },
            },
            "& input::placeholder": {
              fontSize: "14px",
            },
          }}
          {...textFieldProps}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ borderRadius: "0 8px 8px 0" }}
          size={isMobile ? "small" : "medium"}
        >
          <SearchIcon />
        </Button>
      </RowStack>
    </Stack>
  );
};

export default CustomSearchInput;
