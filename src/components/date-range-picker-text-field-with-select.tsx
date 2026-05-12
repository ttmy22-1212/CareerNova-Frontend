import { CalendarToday } from "@mui/icons-material";
import {
  Button,
  ButtonGroup,
  InputAdornment,
  Stack,
  TextField,
} from "@mui/material";
import { format, startOfDay } from "date-fns";
import { DateRangePickerWrapperProps } from "mui-daterange-picker/dist/components/DateRangePickerWrapper";
import { useEffect, useState } from "react";
import { DateRangePickerSubProps } from "./date-range-picker-textfield";
import { getDateDaysAgo } from "@/utils/date-helper";

const DateTimePickerTextFieldWithSelect = (
  props: Omit<DateRangePickerWrapperProps, "toggle" | "open"> &
    DateRangePickerSubProps,
) => {
  const [selectedDay, setSelectedDay] = useState(1);

  const handleSelectedDay = (day: number) => {
    setSelectedDay(day);
  };

  useEffect(() => {
    props.onChange({
      startDate: getDateDaysAgo(selectedDay),
      endDate: startOfDay(new Date()),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDay]);

  return (
    <Stack
      flexDirection="row"
      alignItems="center"
      gap={2}
      sx={{ width: "100%" }}
    >
      <TextField
        label={props.labelHolder}
        value={`${format(getDateDaysAgo(selectedDay), "dd/MM/yyyy")} - ${format(
          startOfDay(new Date()),
          "dd/MM/yyyy",
        )}`}
        InputProps={{
          endAdornment: (
            <InputAdornment
              position="start"
              sx={{ display: "flex", justifyContent: "center" }}
            >
              <CalendarToday />
            </InputAdornment>
          ),
        }}
        sx={{
          minWidth: "fit-content",
        }}
      />

      <ButtonGroup
        variant="outlined"
        sx={{
          minWidth: "fit-content",
        }}
      >
        {[1, 7, 30, 90, 180].map((day) => (
          <Button
            sx={{
              minWidth: "fit-content",
            }}
            key={day}
            variant={selectedDay === day ? "contained" : "outlined"}
            onClick={() => {
              handleSelectedDay(day);
            }}
          >
            {day === 1 ? "Hôm qua" : `${day} ngày trước`}
          </Button>
        ))}
      </ButtonGroup>
    </Stack>
  );
};

export default DateTimePickerTextFieldWithSelect;
