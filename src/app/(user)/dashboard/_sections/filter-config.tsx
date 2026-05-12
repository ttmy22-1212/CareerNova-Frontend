import { CustomFilterItemConfig } from "@/components/custom-filter";
import { FilterOption } from "@/utils/apply-filter";

export type StatisticFilter = {
  region?: string;
  date?: {
    startDate: Date;
    endDate: Date;
  };
};

export type MultipleOptionFilterConfig = FilterOption<
  StatisticFilter,
  StatisticFilter
> &
  CustomFilterItemConfig<StatisticFilter>;

export const getStatsFilterConfig = ({
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
    target: "region",
    key: "region",
    label: "Khu vực",
    xs: isMobile ? 12 : 5,
    type: "text-select",
    options: options["region"],
  },
  {
    compare: () => true,
    target: "date",
    key: "date",
    label: "Thời gian",
    xs: isMobile ? 12 : 7,
    type: "range",
    options: options["date"],
  },
];

export const statsOptions = {
  region: [
    { value: "all", label: "Tất cả" },
    { value: "north", label: "Miền Bắc" },
    { value: "central", label: "Miền Trung" },
    { value: "south", label: "Miền Nam" },
  ],
};
