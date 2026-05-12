export interface OptionsWithChildren {
  label: string;
  value: string;
  children?: OptionsWithChildren[];
}

export const getAllChildrenValues = (option: OptionsWithChildren): string[] => {
  const result: string[] = [];
  option.children?.forEach((c) =>
    result.push(c.value, ...getAllChildrenValues(c)),
  );
  return result;
};
