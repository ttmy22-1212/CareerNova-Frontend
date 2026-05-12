import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import Autocomplete, {
  AutocompleteRenderInputParams,
} from "@mui/material/Autocomplete";
import { Popper } from "@mui/material";
import { removeVietnameseTones } from "@/utils/string-helper";

interface Props {
  value: any;
  options: { value: any; label: string }[];
  onChange: (value: any) => void;
  TextFieldProps: TextFieldProps;
  maxHeightListBox?: number;
  disabled?: boolean;
  freeSolo?: boolean;
}

const AutocompleteTextFieldCore: React.FC<Props> = ({
  value,
  options,
  onChange,
  TextFieldProps,
  maxHeightListBox = 640,
  disabled,
  freeSolo,
}) => {
  const [key, setKey] = useState<any>();

  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleOptionChange = (
    _: any,
    value: string | { value: string; label: string } | null,
  ) => {
    if (value) {
      if (typeof value == "string") {
        onChange(value);
      } else {
        onChange(value.value);
      }
    } else {
      onChange("");
    }
  };

  const renderInput = useCallback(
    (params: AutocompleteRenderInputParams) => (
      <TextField
        {...TextFieldProps}
        {...params}
        InputProps={{
          sx: {
            ...TextFieldProps.InputProps?.sx,
          },
          ...params.InputProps,
        }}
        inputProps={{
          ...TextFieldProps.inputProps,
          ...params.inputProps,
          style: { minWidth: 64 },
        }}
        id={params.id}
        disabled={params.disabled}
        inputRef={inputRef}
      />
    ),
    [TextFieldProps],
  );

  useEffect(() => {
    if (document.activeElement != inputRef.current) {
      setKey(new Date().getTime());
    }
  }, [value]);

  return (
    <Autocomplete
      key={key}
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
      getOptionLabel={(option) =>
        typeof option == "string" ? "Enter" : option.label
      }
      value={options.find((option) => option.value == value) || null}
      renderInput={renderInput}
      onChange={handleOptionChange}
      disabled={disabled}
      freeSolo={freeSolo}
      clearOnBlur
      autoHighlight
      PopperComponent={(props) => (
        <Popper
          {...props}
          sx={{
            ...props.sx,
            zIndex: (theme) => theme.zIndex.modal + 10 + " !important",
          }}
        ></Popper>
      )}
      ListboxProps={{ style: { maxHeight: maxHeightListBox } }}
    />
  );
};

const AutocompleteTextField = memo(AutocompleteTextFieldCore);
export default AutocompleteTextField;
