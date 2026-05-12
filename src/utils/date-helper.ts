import {
  addDays,
  format,
  getDate,
  getDaysInMonth,
  Locale,
  startOfWeek,
  subDays,
  subMonths,
} from "date-fns";

export const timeLines = [
  { label: "Hôm qua", value: "yesterday" },
  { label: "7 ngày trước", value: "7days" },
  { label: "30 ngày trước", value: "30days" },
  { label: "90 ngày trước", value: "90days" },
  { label: "180 ngày trước", value: "180days" },
];

export const convertTimeToSeconds = (time: string) => {
  const [minutes, seconds] = time.split(":").map((item) => parseInt(item));
  return minutes * 60 + seconds;
};

export const getCurrentDayRange = () => {
  const now = new Date();

  const startOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0
  );
  const endOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59
  );

  return {
    date_from: startOfDay.toISOString(),
    date_to: endOfDay.toISOString(),
  };
};
export const formatDate = (date: Date): string => {
  if (!date) return "";
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear().toString();
  return `${day}/${month}/${year}`;
};

export const formatDatetime = (date: Date): string => {
  if (!date) return "";
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear().toString();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

export const monthDiff = (d1: Date, d2: Date) => {
  let months;
  months = (d2.getFullYear() - d1.getFullYear()) * 12;
  months -= d1.getMonth();
  months += d2.getMonth();
  return months <= 0 ? 0 : months;
};

export const nextMonth = (d: Date): Date => {
  if (d.getMonth() == 11) {
    return new Date(d.getFullYear() + 1, 0, 1);
  } else {
    return new Date(d.getFullYear(), d.getMonth() + 1, 1);
  }
};

export const endMonth = (d: Date): Date => {
  if (d.getMonth() == 11) {
    return new Date(new Date(d.getFullYear() + 1, 0, 1).getTime() - 1);
  } else {
    return new Date(
      new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime() - 1
    );
  }
};

export const previousMonth = (d: Date): Date => {
  if (d.getMonth() == 0) {
    return new Date(d.getFullYear() - 1, 11, 1);
  } else {
    return new Date(d.getFullYear(), d.getMonth() - 1, 1);
  }
};

export const startMonth = (d: Date): Date => {
  return new Date(d.getFullYear(), d.getMonth(), 1);
};

export const startDate = (d: Date): Date => {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

export const getDateDaysAgo = (days: number): Date => {
  const today = new Date();
  const pastDate = new Date(today);
  pastDate.setDate(today.getDate() - days);

  pastDate.setHours(0, 0, 0, 0);

  return pastDate;
};

type Option = {
  label: string;
  value: string;
};
export const getDayOptions = (currentDate: Date, len: number): Option[] => {
  const days: Option[] = [];
  for (let i = 0; i < len; i++) {
    const date = addDays(currentDate, -i);
    days.push({
      label: format(date, "dd/MM/yyyy"),
      value: format(date, "yyyy-MM-dd"),
    });
  }
  return days;
};

export const getWeekOptions = (currentDate: Date, len: number): Option[] => {
  const weeks: Option[] = [];
  for (let i = 0; i < len; i++) {
    const start = startOfWeek(addDays(currentDate, -i * 7), {
      weekStartsOn: 1,
    });
    const end = addDays(start, 6);
    weeks.push({
      label: `${format(start, "dd/MM")} - ${format(end, "dd/MM")}`,
      value: format(start, "yyyy-MM-dd"),
    });
  }
  return weeks;
};

export const getMonthOptions = (currentDate: Date, len: number): Option[] => {
  const length = len || 6;
  const months: Option[] = [];
  for (let i = 0; i < length; i++) {
    const month = subMonths(currentDate, i);
    months.push({
      label: format(month, "MM/yyyy"),
      value: format(month, "yyyy-MM"),
    });
  }
  return months;
};

export const convertTapPaymentDate = (excelDate: number) => {
  const excelEpoch = new Date(Date.UTC(1900, 0, 1));
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const correctedTimeUTC =
    excelEpoch.getTime() + (excelDate - 2) * millisecondsPerDay;
  const correctedDate = new Date(correctedTimeUTC);
  return correctedDate;
};

export const getPhase = (date: Date) => {
  const dayOfMonth = getDate(date);
  const totalDaysInMonth = getDaysInMonth(date);

  if (dayOfMonth >= 1 && dayOfMonth <= 15) {
    return 1;
  } else if (dayOfMonth >= 16 && dayOfMonth <= totalDaysInMonth) {
    return 2;
  }

  throw new Error("Invalid date");
};

export const coverTapPaymentFilterDate = (date?: string): Date => {
  let month: number, year: number;
  if (date) {
    [month, year] = date.split("-").map(Number);
    return new Date(year, month - 1, 1);
  } else {
    return new Date();
  }
};

export const coverTapCreatorInfoFilterDate = (date?: string): Date => {
  let month: number, year: number;
  if (date) {
    [month, year] = date.split("-").map(Number);
    return new Date(year, month - 1, 1);
  } else {
    return new Date();
  }
};

export const convertTapCreatorPaymentFilterDate = (date?: string): Date => {
  let day: number, month: number, year: number;
  if (date) {
    [day, month, year] = date.split("-").map(Number);
    return new Date(year, month - 1, day);
  } else {
    return new Date();
  }
};

export const getCustomDateRange = (days: number) => {
  const today = new Date();
  const startDate = subDays(today, days - 1); // Lùi lại days-1 để có đủ days ngày

  const startStr = format(startDate, "dd/MM");
  const endStr = format(today, "dd/MM");

  return `Doanh thu (${startStr}-${endStr})`;
};
