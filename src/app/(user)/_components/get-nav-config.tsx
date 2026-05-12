import { paths } from "@/paths";

export interface NavConfigProps {
  title: string;
  href: string;
}

export const getNavConfig = (): NavConfigProps[] => [
  {
    title: "Trang chủ",
    href: paths.dashboard,
  },
  {
    title: "Phân tích nghề",
    href: paths.career.index,
  },
  {
    title: "Lộ trình",
    href: paths.roadmap.index,
  },
  {
    title: "Diễn đàn",
    href: paths.forum,
  },
];
