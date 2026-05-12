import {
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  GridProps,
  InputAdornment,
  Radio,
  RadioGroup,
  SvgIcon,
  Switch,
  TextField,
  TextFieldProps,
  Typography,
} from "@mui/material";
import {
  DatePicker,
  DatePickerProps,
  DateTimePicker,
  DateTimePickerProps,
} from "@mui/x-date-pickers";
import { DateRange } from "mui-daterange-picker";
import AutocompleteTextField from "./autocomplete-textfield";
import AutocompleteTextFieldMultiple from "./autocomplete-textfield-multiple";
import DateRangePickerTextField from "./date-range-picker-textfield";
import DeepMultipleSelect from "./deep-multiple-select";
import MultipleSelectOption from "./multiple-select-option";
import SingleSelectOption from "./single-select-option";
import SingleSelectOption2 from "./single-select-option-2";
import TextSelection from "./text-selection";
import TextSelectionOptionRange from "./text-selection-option-range";
import { Calendar } from "iconsax-react";
import { FilterOption } from "@/utils/apply-filter";
import DateTimePickerTextFieldWithSelect from "./date-range-picker-text-field-with-select";

type FilterType =
  | "text"
  | "number"
  | "select"
  | "select-multiple"
  | "range"
  | "range-with-select"
  | "datepicker"
  | "datetimepicker"
  | "radio"
  | "check-box"
  | "single-select-option"
  | "single-select-option-2"
  | "multiple-select-option"
  | "deep-multiple-select-option"
  | "text-select-option-range"
  | "text-select"
  | "switch";

type CustomFilterItemConfigDatePicker =
  | {
      type: "datepicker";
      ComponentProps?: DatePickerProps<any>;
    }
  | {
      type: Exclude<FilterType, "datepicker">;
      ComponentProps?: TextFieldProps;
    };

type CustomFilterItemConfigDateTimePicker =
  | {
      type: "datetimepicker";
      ComponentProps?: DateTimePickerProps<any>;
    }
  | {
      type: Exclude<FilterType, "datetimepicker">;
      ComponentProps?: TextFieldProps;
    };

export type CustomFilterItemConfig<T> = {
  key: keyof T;
  label: string;
  xs: GridProps["xs"];
  type: FilterType;
  target: keyof T;
  /**
   * @deprecated use ComponentProps instead
   */
  TextFieldProps?: TextFieldProps;
  ComponentProps?: TextFieldProps;
  maxLengthToShow?: number;
  icon?: React.ReactNode;
  options?: { value: any; label: string }[];
  hide?: boolean;
  hiddenFillRangeValueAction?: boolean;
  getCustomValueLabel?: (value: any) => string;
} & CustomFilterItemConfigDatePicker &
  CustomFilterItemConfigDateTimePicker;

export type CustomOptionFilterConfig<T> = FilterOption<T, T> &
  CustomFilterItemConfig<T>;

export interface CustomerFilterProps<T> {
  filter: Partial<T>;
  onChange: (filter: Partial<T>) => void;
  configs: CustomFilterItemConfig<T>[];
  GridContainerProps?: GridProps;
  children?: React.ReactNode;
}

function CustomFilter<T, P extends FilterType>({
  filter,
  onChange,
  configs,
  GridContainerProps,
  children,
}: CustomerFilterProps<T>) {
  const renderComponentByType = (config: CustomFilterItemConfig<T>) => {
    switch (config.type) {
      case "text":
        return (
          <Grid item xs={config.xs} key={String(config.key)}>
            <TextField
              fullWidth
              value={filter[config.key] || ""}
              placeholder={config.label || "Tìm kiếm..."}
              onChange={(e) =>
                onChange({ ...filter, [config.key]: e.target.value })
              }
              variant={
                config.TextFieldProps?.label || config.ComponentProps?.label
                  ? undefined
                  : "outlined"
              }
              {...config.TextFieldProps}
              {...config.ComponentProps}
            />
          </Grid>
        );
      case "number":
        return (
          <Grid item xs={config.xs} key={String(config.key)}>
            <TextField
              fullWidth
              // variant="outlined"
              value={filter[config.key] || ""}
              type="number"
              onChange={(e) =>
                onChange({
                  ...filter,
                  [config.key]: Number(e.target.value),
                })
              }
              {...config.TextFieldProps}
              {...config.ComponentProps}
            />
          </Grid>
        );
      case "select":
        return (
          <Grid item xs={config.xs} key={String(config.key)}>
            <AutocompleteTextField
              TextFieldProps={{
                fullWidth: true,
                ...config.TextFieldProps,
                ...config.ComponentProps,
                variant:
                  config.TextFieldProps?.label || config.ComponentProps?.label
                    ? undefined
                    : "outlined",
                InputProps: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SvgIcon color="secondary">
                        <Calendar variant="Bold" />
                      </SvgIcon>
                    </InputAdornment>
                  ),
                },
              }}
              value={filter[config.key] || ""}
              onChange={(value) => {
                onChange({
                  ...filter,
                  [config.key]: value,
                });
              }}
              options={config.options || []}
            />
          </Grid>
        );
      case "select-multiple":
        return (
          <Grid item xs={config.xs} key={String(config.key)}>
            <AutocompleteTextFieldMultiple
              TextFieldProps={{ ...config.ComponentProps }}
              value={
                Array.isArray(filter[config.key])
                  ? (filter[config.key] as any[]) || []
                  : filter[config.key]
                  ? [filter[config.key] || undefined]
                  : []
              }
              onChange={(values) =>
                onChange({
                  ...filter,
                  [config.key]: values.length > 0 ? values : undefined,
                })
              }
              options={config.options || []}
            />
          </Grid>
        );
      case "range-with-select":
        return (
          <Grid item xs={config.xs} key={String(config.key)}>
            <DateTimePickerTextFieldWithSelect
              {...config.ComponentProps}
              labelHolder={config.label}
              initialDateRange={filter[config.key] as DateRange}
              onChange={(value) => onChange({ ...filter, [config.key]: value })}
            />
          </Grid>
        );
      case "range":
        return (
          <Grid item xs={config.xs} key={String(config.key)}>
            <DateRangePickerTextField
              {...config.ComponentProps}
              labelHolder={config.label}
              initialDateRange={filter[config.key] as DateRange}
              onChange={(value) => onChange({ ...filter, [config.key]: value })}
            />
          </Grid>
        );
      case "datepicker":
        return (
          <Grid item xs={config.xs} key={String(config.key)}>
            <DatePicker
              label={config.label}
              {...config.ComponentProps}
              value={
                filter[config.key]
                  ? new Date(filter[config.key] as string | number)
                  : null
              }
              onChange={(date) => onChange({ ...filter, [config.key]: date })}
            />
          </Grid>
        );
      case "datetimepicker":
        return (
          <Grid item xs={config.xs} key={String(config.key)}>
            <DateTimePicker
              {...config.ComponentProps}
              value={
                filter[config.key]
                  ? new Date(filter[config.key] as string | number)
                  : null
              }
              onAccept={(date) => onChange({ ...filter, [config.key]: date })}
            />
          </Grid>
        );
      case "radio":
        return (
          <Grid item xs={config.xs} key={String(config.key)}>
            <FormControl component="fieldset">
              <RadioGroup
                value={filter[config.key] as string | undefined}
                onChange={(e) =>
                  onChange({
                    ...filter,
                    [config.key]: e.target.value,
                  })
                }
                sx={{
                  display: "flex",
                  flexDirection: "row",
                }}
              >
                {config.options?.map((option) => (
                  <FormControlLabel
                    key={option.value}
                    value={option.value}
                    label={
                      <Typography fontSize={16} fontWeight={400}>
                        {option.label}
                      </Typography>
                    }
                    control={<Radio />}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Grid>
        );
      case "check-box":
        return (
          <Grid item xs={config.xs} key={String(config.key)}>
            <FormControl component="fieldset">
              <RadioGroup
                value={filter[config.key] as string | undefined}
                onChange={(e) =>
                  onChange({
                    ...filter,
                    [config.key]: e.target.value,
                  })
                }
                sx={{
                  display: "flex",
                  flexDirection: "row",
                }}
              >
                {config.options?.map((option) => (
                  <FormControlLabel
                    key={option.value}
                    value={option.value}
                    label={
                      <Typography fontSize={16} fontWeight={400}>
                        {option.label}
                      </Typography>
                    }
                    control={<Checkbox />}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Grid>
        );
      case "single-select-option":
        return (
          <Grid item xs={config.xs} key={String(config.key)}>
            <SingleSelectOption
              filter={filter}
              onChange={onChange}
              config={config}
            />
          </Grid>
        );
      case "single-select-option-2":
        return (
          <Grid item xs={config.xs} key={String(config.key)}>
            <SingleSelectOption2
              filter={filter}
              onChange={onChange}
              config={config}
            />
          </Grid>
        );
      case "multiple-select-option":
        return (
          <Grid item xs={config.xs} key={String(config.key)}>
            <MultipleSelectOption
              filter={filter}
              onChange={onChange}
              config={config}
            />
          </Grid>
        );
      case "deep-multiple-select-option":
        return (
          <Grid item xs={config.xs} key={String(config.key)}>
            <DeepMultipleSelect
              filter={filter}
              onChange={onChange}
              config={config}
            />
          </Grid>
        );
      case "text-select-option-range":
        return (
          <Grid item xs={config.xs} key={String(config.key)}>
            <TextSelectionOptionRange
              filter={filter}
              onChange={onChange}
              config={config}
            />
          </Grid>
        );
      case "text-select":
        return (
          <Grid item xs={config.xs} key={String(config.key)}>
            <TextSelection
              filter={filter}
              onChange={onChange}
              config={config}
            />
          </Grid>
        );
      case "switch":
        return (
          <Grid item xs={config.xs} key={String(config.key)}>
            <FormControlLabel
              control={
                <Switch
                  checked={!!filter[config.key]}
                  onChange={(e) =>
                    onChange({ ...filter, [config.key]: e.target.checked })
                  }
                />
              }
              label={config.label}
              sx={{
                height: "100%",
                ...config.ComponentProps?.sx,
              }}
            />
          </Grid>
        );
      default:
        return null;
    }
  };

  return (
    <Grid spacing={2} {...GridContainerProps} container>
      {configs
        .filter((c) => !c.hide)
        .map((config) => renderComponentByType(config))}
      {children}
    </Grid>
  );
}

export default CustomFilter;
