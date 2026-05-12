import { TableSortLabel, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import {
  CustomTableProps,
  CustomTableSortModel,
  CustomTableConfig,
} from "./custom-table.types";
import CustomTableCellShadow from "./cutom-table-cell-shadow";
import { CardTableResizableCell } from "./card-table-resizable-cell";

export function CustomTableHeaderCell<
  P,
  T extends { id: P; [key: string]: any },
>(
  props: CustomTableProps<P, T> & {
    sortModel?: CustomTableSortModel<P, T>;
    onClickSort?: (key: keyof T | string) => void;
    onResize?: () => void;
    hasGroupedHeaderLabel: boolean;
    config: CustomTableConfig<P, T>;
  },
) {
  const { hasGroupedHeaderLabel, configs, config, sortModel, onClickSort } =
    props;

  return (
    <CardTableResizableCell
      {...config.headerCellProps}
      onResized={props.onResize}
      disableResize={!props.flexible}
      sx={
        {
          whiteSpace: "nowrap",
          position: "relative",
          border: "none",
          width: config?.width,
          ...config.headerCellProps?.sx,
        } as any
      }
      rowSpan={!config.groupedHeaderLabel && hasGroupedHeaderLabel ? 2 : 1}
      colSpan={
        !config.groupedHeaderLabel
          ? 1
          : configs.filter(
              (c) => c.groupedHeaderLabel == config.groupedHeaderLabel,
            ).length
      }
      align={!config.groupedHeaderLabel ? undefined : "center"}
    >
      {config.groupedHeaderLabel || (
        <TableSortLabel
          active={sortModel?.key == config.key && config.sortable}
          direction={sortModel?.key == config.key ? sortModel.direction : "asc"}
          onClick={
            config.sortable
              ? () => config.key !== "" && onClickSort?.(config.key)
              : undefined
          }
          hideSortIcon={config.key === "" || !config.sortable ? true : false}
          sx={{ cursor: config.sortable ? "pointer" : "default" }}
          disabled={!config.sortable}
        >
          <Stack
            gap={1}
            alignItems="center"
            direction="row"
            justifyContent="center"
          >
            {config.headerIcon}
            <Typography variant="subtitle2" fontSize={14} fontWeight={500}>
              {config.headerLabel}{" "}
            </Typography>
            {config.suffixIcon}
          </Stack>
        </TableSortLabel>
      )}
      <CustomTableCellShadow
        shadowRight={config.shadowRight}
        shadowLeft={config.shadowLeft}
      />
    </CardTableResizableCell>
  );
}
