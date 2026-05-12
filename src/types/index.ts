export type OptionType<T = string> = { label: string; value: T };

export type ResponseWithTotal<T = any> = {
  total?: number;
  data: T;
};

export type ResponseWithMessage<T = any> = {
  message: string;
  data: T;
};

