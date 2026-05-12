import { CustomFilterItemConfig } from "@/components/custom-filter";
import { FilterOption } from "@/utils/apply-filter";

export type CareerFilter = {
  skills: string[];
  salary: number;
  major: string;
  experience: number;
};
export type MultipleOptionFilterConfig = FilterOption<
  CareerFilter,
  CareerFilter
> &
  CustomFilterItemConfig<CareerFilter>;

export const getFilterConfig = ({
  options,
  isMobile,
}: {
  options: Partial<{
    [name in Partial<
      MultipleOptionFilterConfig["key"]
    >]: MultipleOptionFilterConfig["options"];
  }>;
  isMobile?: boolean;
}): MultipleOptionFilterConfig[] => [
  {
    compare: () => true,
    target: "skills",
    key: "skills",
    label: "Kỹ năng",
    xs: isMobile ? 12 : 6,
    type: "select-multiple",
    options: options["skills"],
    ComponentProps: {
      placeholder: "Tất cả",
      label: "Kỹ năng",
    },
  },
  {
    compare: () => true,
    target: "experience",
    key: "experience",
    label: "Kinh nghiệm",
    xs: isMobile ? 12 : 6,
    type: "select",
    options: options["experience"],
    ComponentProps: {
      placeholder: "Tất cả",
      label: "Kinh nghiệm",
    },
  },
  {
    compare: () => true,
    target: "salary",
    key: "salary",
    label: "Mức lương",
    xs: isMobile ? 12 : 6,
    type: "select",
    options: options["salary"],
    ComponentProps: {
      placeholder: "Tất cả",
      label: "Mức lương",
    },
  },
  {
    compare: () => true,
    target: "major",
    key: "major",
    label: "Chuyên ngành",
    xs: isMobile ? 12 : 6,
    type: "select",
    options: options["major"],
    ComponentProps: {
      placeholder: "Tất cả",
      label: "Chuyên ngành",
    },
  },
];
