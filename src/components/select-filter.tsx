import {
  FormControl,
  Grid2,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";

interface SelectFilterProps {
  configs: {
    label: string;
    xs: number;
    key: string;
    options: {
      value: string;
      label: string;
    }[];
  }[];
  filter: {
    [key: string]: string;
  };
  onChange: (key: string, value: string) => void;
}

const SelectFilter = ({ configs, filter, onChange }: SelectFilterProps) => {
  const handleChange = (key: string, event: SelectChangeEvent<string>) => {
    if(event.target.value === "Tất cả") {
      onChange(key, "");
    }
    else onChange(key, event.target.value);
  }

  return (
    <Grid2 container spacing={1.5}>
      {configs.map(({ label, xs, key }, index) => (
        <Grid2 size={{ xs: xs }} key={key}>
          <FormControl fullWidth>
            <InputLabel>{label}</InputLabel>
            <Select
              margin='dense'
              id={key}
              label={label}
              fullWidth
              variant='outlined'
              value={filter[key]===""?"Tất cả":filter[key]}
              onChange={(e) => handleChange(key,e)}
            >
              {configs[index].options.map(({ value, label }) => (
                <MenuItem key={value} value={label}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid2>
      ))}
    </Grid2>
  );
};

export default SelectFilter;
