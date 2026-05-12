import {
  Breadcrumbs as MUIBreadcrumbs,
  Typography,
  Stack,
  Box,
  Link,
} from "@mui/material";
import { useRouter } from "next/navigation";

import { ReactNode } from "react";
import type { FC } from "react";
import RowStack from "./row-stack";

export interface BreadcrumbItem {
  link?:
    | string
    | {
        pathname: string;
        query?: Record<string, string | string[] | undefined>;
      };
  label: string;
  icon?: ReactNode;
}

interface CustomBreadcrumbProps {
  data: BreadcrumbItem[];
}

const CustomBreadcrumbs: FC<CustomBreadcrumbProps> = ({ data }) => {
  const router = useRouter();
  return (
    <RowStack>
      <MUIBreadcrumbs separator="/" aria-label="breadcrumb">
        {data.map(({ label, link, icon }, index) => (
          <RowStack key={index} gap={1}>
            {icon && <RowStack mr={1}>{icon}</RowStack>}
            {link ? (
              <Link
                color={"black"}
                underline="hover"
                component={Link}
                href={
                  link ? (typeof link === "string" ? link : link.pathname) : ""
                }
              >
                {label}
              </Link>
            ) : index < data.length - 1 ? (
              <Typography
                color={"black"}
                onClick={() => router.back()}
                sx={{ cursor: "pointer" }}
              >
                {label}
              </Typography>
            ) : (
              <Typography sx={{ color: "primary.main" }}>{label}</Typography>
            )}
          </RowStack>
        ))}
      </MUIBreadcrumbs>
    </RowStack>
  );
};

export default CustomBreadcrumbs;
