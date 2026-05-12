import React, { useEffect, useRef, useState } from "react";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import Autocomplete, {
  AutocompleteRenderInputParams,
} from "@mui/material/Autocomplete";
import { Popper, useMediaQuery, Theme } from "@mui/material";
import { removeVietnameseTones } from "@/utils/string-helper";

interface Props {
  value: any[];
  options: { value: any; label: string }[];
  onChange: (value: any[]) => void;
  TextFieldProps: TextFieldProps;
  freeSolo?: boolean;
}

const AutocompleteTextFieldMultiple: React.FC<Props> = ({
  value,
  options: initialOptions,
  onChange,
  TextFieldProps,
  freeSolo = false,
}) => {
  const isSm = useMediaQuery((theme: Theme) => theme.breakpoints.down("lg"));

  const [options, setOptions] = useState(initialOptions);
  const [key, setKey] = useState<any>();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setOptions(initialOptions);
  }, [initialOptions]);

  const handleChange = (_: any, newValue: any[]) => {
    const values = newValue.map((v) => {
      if (typeof v === "string") {
        return v;
      }
      return v.value;
    });
    onChange(values);
  };

  const renderInput = (params: AutocompleteRenderInputParams) => (
    <TextField
      {...TextFieldProps}
      {...params}
      placeholder={value.length == 0 ? TextFieldProps.placeholder : ""}
      InputProps={{
        sx: {
          ...TextFieldProps?.InputProps?.sx,
          overflow: "hidden",
          whiteSpace: "nowrap",
          "&.MuiAutocomplete-inputRoot": {
            flexWrap: "nowrap",
          },
        },
        ...params.InputProps,
      }}
      inputRef={inputRef}
    />
  );

  useEffect(() => {
    if (document.activeElement !== inputRef.current) {
      setKey(new Date().getTime());
    }
  }, [value]);

  return (
    <Autocomplete
      disableClearable
      key={key}
      value={options.filter((option) => value.includes(option.value))}
      options={options}
      filterOptions={(options, state) => [
        ...options.filter((option) =>
          removeVietnameseTones(option.label.toLowerCase()).includes(
            removeVietnameseTones(state.inputValue.toLowerCase()),
          ),
        ),
        ...(freeSolo && state.inputValue
          ? [
              {
                value: state.inputValue,
                label: state.inputValue + " (mới)",
              },
            ]
          : []),
      ]}
      getOptionLabel={(value) => {
        return typeof value === "string"
          ? options.find((o) => o.value == value)?.label || ""
          : value?.label || "";
      }}
      renderInput={renderInput}
      onChange={handleChange}
      autoHighlight
      disableCloseOnSelect
      limitTags={!isSm ? 1 : 10}
      multiple
      freeSolo={freeSolo}
      PopperComponent={(props) => (
        <Popper
          {...props}
          sx={{
            ...props.sx,
            zIndex: (theme) => `${theme.zIndex.drawer + 10} !important`,
          }}
        />
      )}
    />
  );
};

export default AutocompleteTextFieldMultiple;
