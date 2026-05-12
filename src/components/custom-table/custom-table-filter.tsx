import {
  TableCell,
  TableRow,
  TextField,
  TextFieldProps,
  styled,
} from "@mui/material";
import {
  DatePicker,
  DatePickerProps,
  DateTimePicker,
  DateTimePickerProps,
} from "@mui/x-date-pickers";

const NoLabelTextField = styled(TextField)<TextFieldProps>(() => ({
  "& .MuiInputBase-input.MuiFilledInput-input": {
    paddingTop: "8px",
  },
}));
const CustomStyledDatePicker = styled(DatePicker)(() => ({
  "& .MuiInputBase-input.MuiFilledInput-input": {
    paddingTop: "11px",
  },
}));

type FilterType =
  | "none"
  | "number"
  | "text"
  | "select"
  | "select-multiple"
  | "range"
  | "datepicker"
  | "datetimepicker";

type CustomTableFilterItemConfigDatePicker =
  | {
      type: "datepicker";
      ComponentProps?: DatePickerProps<any>;
    }
  | {
      type: Exclude<FilterType, "datepicker">;
      ComponentProps?: TextFieldProps;
    };

type CustomTableFilterItemConfigDateTimePicker =
  | {
      type: "datetimepicker";
      ComponentProps?: DateTimePickerProps<any>;
    }
  | {
      type: Exclude<FilterType, "datetimepicker">;
      ComponentProps?: TextFieldProps;
    };

export type CustomTableFilterItemConfig<T> =
  | {
      type: "none";
      key?: keyof T | undefined;
      options?: { value: any; label: string }[];
    }
  | ({
      type: FilterType;
      key: keyof T;
      label?: string;
      hide?: boolean;
      /**
       * @deprecated use ComponentProps instead
       */
      TextFieldProps?: TextFieldProps;
      ComponentProps?: TextFieldProps;
      options?: { value: any; label: string }[];
    } & CustomTableFilterItemConfigDatePicker &
      CustomTableFilterItemConfigDateTimePicker);

export interface CustomerFilterProps<T> {
  filter: Partial<T>;
  onChange: (filter: Partial<T>) => void;
  configs: CustomTableFilterItemConfig<T>[];
}

function CustomTableFilter<T, P extends FilterType>({
  filter,
  onChange,
  configs,
}: CustomerFilterProps<T>) {
  return (
    <TableRow
      sx={{
        ".MuiTableCell-root": {
          background: (theme) => theme.palette.neutral[100],
        },
      }}
    >
      {configs.map((config, index) => {
        if (config.type === "none") {
          return <TableCell align='center' key={index}></TableCell>;
        } else if (config.type === "text") {
          return (
            <TableCell key={config.key as string} align='center'>
              <NoLabelTextField
                fullWidth
                value={filter[config.key] || undefined}
                onChange={(e) =>
                  onChange({ ...filter, [config.key]: e.target.value })
                }
                {...config.TextFieldProps}
              />
            </TableCell>
          );
        } else if (config.type === "number") {
          return (
            <TableCell key={String(config.key)} align='center'>
              <NoLabelTextField
                fullWidth
                // variant="outlined"
                value={filter[config.key] || undefined}
                type='number'
                onChange={(e) =>
                  onChange({
                    ...filter,
                    [config.key]: Number(e.target.value),
                  })
                }
                {...config.TextFieldProps}
              />
            </TableCell>
          );
        } else if (config.type === "select") {
          return (
            <TableCell key={config.key as string} align='center'>
              {/* <AutocompleteTextField
                TextFieldProps={{
                  variant: "outlined",
                  fullWidth: true,
                  ...config.TextFieldProps,
                }}
                value={filter[config.key] || ""}
                onChange={(option) =>
                  onChange({
                    ...filter,
                    [config.key]: option ? option.value : "",
                  })
                }
                options={config.options || []}
              /> */}
            </TableCell>
          );
        } else if (config.type === "select-multiple") {
          return (
            <TableCell key={String(config.key)} align='center'>
              {/* <AutocompleteTextFieldMultiple
                TextFieldProps={{
                  fullWidth: true,
                  ...config.TextFieldProps,
                }}
                value={((filter[config.key] as any[]) || [])
                  .map((v) => config.options?.find((o) => o.value === v)!)
                  .filter((v) => v?.value)}
                onChange={(values) =>
                  onChange({
                    ...filter,
                    [config.key]: values.map((v: any) => v.value),
                  })
                }
                options={config.options || []}
              /> */}
            </TableCell>
          );
        } else if (config.type === "range") {
          return (
            <TableCell key={String(config.key)} align='center'>
              {/* <DateRangePickerTextField
                initialDateRange={filter[config.key] as DateRange}
                onChange={(value) =>
                  onChange({ ...filter, [config.key]: value })
                }
                // onClear={() => {}}
              /> */}
            </TableCell>
          );
        } else if (config.type === "datepicker") {
          return (
            <TableCell key={String(config.key)} align='center'>
              <DatePicker
                {...config.ComponentProps}
                value={
                  filter[config.key]
                    ? new Date(filter[config.key] as string | number)
                    : null
                }
                onChange={(value) =>
                  onChange({ ...filter, [config.key]: value.toISOString() })
                }
              />
            </TableCell>
          );
        } else if (config.type === "datetimepicker") {
          return (
            <TableCell key={String(config.key)} align='center'>
              <DateTimePicker
                {...config.ComponentProps}
                value={
                  filter[config.key]
                    ? new Date(filter[config.key] as string | number)
                    : null
                }
                onAccept={(value) =>
                  onChange({ ...filter, [config.key]: value })
                }
              />
            </TableCell>
          );
        }
      })}
    </TableRow>
  );
}

export default CustomTableFilter;
