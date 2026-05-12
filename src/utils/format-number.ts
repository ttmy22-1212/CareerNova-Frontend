import { min } from "lodash";

export const formatNumber = (amount: number, index: number) => {
  if (amount === 0) {
    return "0";
  }

  if (!amount && amount !== 0) {
    return "";
  }

  // Xử lý dấu âm
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  let formattedNumber = parseFloat(absAmount.toString());
  let suffix = "";

  if (absAmount >= 1e9) {
    suffix = " tỉ";
    formattedNumber = absAmount / 1e9;
  } else if (absAmount >= 1e6) {
    suffix = " tr";
    formattedNumber = absAmount / 1e6;
  } else if (absAmount >= 1e3) {
    suffix = " k";
    formattedNumber = absAmount / 1e3;
  }

  let result = formattedNumber.toFixed(index).replace(".", ",");

  // Loại bỏ ',0' hoặc ',00' nếu cần
  if (result.endsWith(",0")) {
    result = result.slice(0, -2);
  } else if (result.endsWith(",00")) {
    result = result.slice(0, -3);
  }

  // Thêm dấu âm nếu cần
  return `${isNegative ? "-" : ""}${result}${suffix}`;
};

export const formatNumberEng = (amount: number, index: number) => {
  let formattedNumber = amount;
  let suffix = "";

  if (amount >= 1e9) {
    suffix = "B";
    formattedNumber = amount / 1e9;
  } else if (amount >= 1e6) {
    suffix = "M";
    formattedNumber = amount / 1e6;
  } else if (amount >= 1e3) {
    suffix = "K";
    formattedNumber = amount / 1e3;
  }

  // Convert to fixed decimal places and replace '.' with ','
  let result = formattedNumber.toFixed(index).replace(".", ",");

  // Remove trailing ',0' if present
  if (result.endsWith(",0")) {
    result = result.slice(0, -2);
  }

  // Return the formatted number with suffix
  return `${result}${suffix}`;
};

export function getRangeValueLabel(
  valueArray: (number | undefined)[],
  unit?: string,
): string {
  if (valueArray.length != 2) {
    return "N/A";
  }

  const [minValue, maxValue] = valueArray;
  if (minValue !== undefined && maxValue !== undefined) {
    return `${formatNumberEng(minValue, 0)}${unit || ""} - ${formatNumberEng(
      maxValue,
      0,
    )}${unit || ""}`;
  }
  if (maxValue !== undefined) {
    return `<${formatNumberEng(maxValue, 0)}${unit || ""}`;
  }
  if (minValue !== undefined) {
    return `>${formatNumberEng(minValue, 0)}${unit || ""}`;
  }

  return "";
}

export const formatTime = (time: number) =>
  `${Math.floor(time / 60)}:${`0${Math.floor(time % 60)}`.slice(-2)}`;

export const calculateLiveStreamTime = (
  startLiveDate: string,
  endLiveDate: string,
) => {
  const start = new Date(startLiveDate);
  const end = new Date(endLiveDate);
  let diff = end.getTime() - start.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  diff -= days * (1000 * 60 * 60 * 24);

  const hours = Math.floor(diff / (1000 * 60 * 60));
  diff -= hours * (1000 * 60 * 60);

  const minutes = Math.floor(diff / (1000 * 60));
  let timeString = "";
  if (days > 0) timeString += `${days}d `;
  if (hours > 0 || days > 0) timeString += `${hours}h `;
  if (minutes > 0 || hours > 0 || days > 0) timeString += `${minutes}m`;

  return timeString.trim();
};

export const formatDate = (date: string) => {
  // I want to extract and format with format dd/mm/yyyy from date
  const day = new Date(date).getDate();
  const month = new Date(date).getMonth() + 1;
  const year = new Date(date).getFullYear();
  return `${day}/${month}/${year}`;
};

export const formatSecondDuration = (
  duration: number,
  { hideSecond = false }: { hideSecond?: boolean } = {},
): string => {
  if (duration < 60) {
    return `${duration}s`;
  } else if (duration < 3600) {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}m ${seconds > 0 ? `${seconds}s` : ""}`.trim();
  } else {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;
    return `${hours}h ${minutes > 0 ? `${minutes}m` : ""} ${
      seconds > 0 && !hideSecond ? `${seconds}s` : ""
    }`.trim();
  }
};

export const formatMilisecondDuration = (durationMs: number): string => {
  if (durationMs === 0 || durationMs === undefined) {
    return "0s";
  }
  const duration = Math.floor(durationMs / 1000);

  if (duration < 60) {
    return `${duration}s`;
  } else if (duration < 3600) {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}m ${seconds > 0 ? `${seconds}s` : ""}`.trim();
  } else {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;
    return `${hours}h ${minutes > 0 ? `${minutes}m` : ""} ${
      seconds > 0 ? `${seconds}s` : ""
    }`.trim();
  }
};

export const formatSecondsDuration = (seconds: number | undefined): string => {
  if (seconds === undefined || isNaN(seconds)) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
};

export const formatMilisecondsDuration = (
  milliseconds: number | undefined,
): string => {
  if (milliseconds === undefined || isNaN(milliseconds)) {
    return "00:00";
  }

  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
};

export const splitNumber = (amount: number) => {
  // add dot each 3 digits from right to left
  const amountString = amount.toString();
  const amountLength = amountString.length;
  let result = "";
  for (let i = amountLength - 1; i >= 0; i--) {
    result = amountString[i] + result;
    if ((amountLength - i) % 3 === 0 && i !== 0) {
      result = "." + result;
    }
  }

  return result;
};

export const formatNumToVND = (num: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(num);
};

export const formatNumToUSD = (num: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num);
};
export const parseFormattedNumber = (value: string) => {
  return value.replace(/\./g, "");
};
