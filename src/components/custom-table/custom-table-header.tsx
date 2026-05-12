import {
  TableHead,
  TableRow,
  TableCell,
  Checkbox,
  Typography,
} from "@mui/material";
import { Stack } from "@mui/system";
import { useMemo } from "react";
import { CustomTableHeaderCell } from "./custom-table-header-cell";
import { CustomTableProps, CustomTableSortModel } from "./custom-table.types";
import CustomTableCellShadow from "./cutom-table-cell-shadow";
import { CardTableResizableCell } from "./card-table-resizable-cell";

export function CustomTableHeader<P, T extends { id: P; [key: string]: any }>(
  props: CustomTableProps<P, T> & {
    sortModel?: CustomTableSortModel<P, T>;
    onClickSort?: (key: keyof T | string) => void;
    onResized?: () => void;
  }
) {
  const {
    rows,
    configs,
    actions,
    renderRowActions,
    onClickEdit,
    onClickDelete,
    onClickDetail,
    indexColumn,
    stickyIndex,
    select,
    stickyHeader,
    flexible,
  } = props;

  const hasGroupedHeaderLabel = useMemo(
    () => configs.some((c) => c.groupedHeaderLabel),
    [configs]
  );
  return (
    <TableHead
      sx={{
        ...(stickyHeader ? { position: "sticky", top: -1, zIndex: 2 } : {}),
        bgcolor: "background.paper-tertiary",
        zIndex: 11,
        left: 0,
      }}
    >
      <TableRow>
        {(indexColumn || select) && (
          <CardTableResizableCell
            sx={{
              whiteSpace: "nowrap",
              py: 2,
              border: "none",
              position: stickyIndex ? "sticky" : "relative",
              left: 0,
              zIndex: 12,
            }}
            rowSpan={hasGroupedHeaderLabel ? 2 : 1}
            disableResize={!flexible}
          >
            <Stack
              direction='row'
              gap={1}
              alignItems='center'
              justifyContent='center'
            >
              {select && (
                <Checkbox
                  sx={{ my: -1, mx: -0.5 }}
                  checked={select.selected.length >= rows.length}
                  onChange={(e, checked) =>
                    checked
                      ? select.handleSelectAll()
                      : select.handleDeselectAll()
                  }
                />
              )}
              {indexColumn && <Typography variant='subtitle2'>STT</Typography>}
            </Stack>
          </CardTableResizableCell>
        )}
        {configs.map((config, index) =>
          index == 0 ||
          !config.groupedHeaderLabel ||
          config.groupedHeaderLabel != configs[index - 1].groupedHeaderLabel ? (
            <CustomTableHeaderCell
              key={config.key.toString()}
              {...props}
              hasGroupedHeaderLabel={hasGroupedHeaderLabel}
              config={
                index >= configs.length - (props.frozenLastColumns || 0)
                  ? {
                      ...config,
                      headerCellProps: {
                        ...config.headerCellProps,
                        sx: {
                          ...config.headerCellProps?.sx,
                          position: "sticky",
                          right: 0,
                        },
                      },
                    }
                  : config
              }
            />
          ) : null
        )}

        {(actions ||
          onClickDelete ||
          onClickDetail ||
          onClickEdit ||
          renderRowActions) && (
          <TableCell
            align='center'
            width='120px'
            sx={{
              py: 1,
              position: "sticky",
              top: props.stickyHeader ? 0 : undefined,
              right: 0,
              zIndex: 100,
              // filter: "drop-shadow(-2px 0 5px -2px rgba(0,0,0,0.2))",
              boxShadow: "-20px 0 50px -2px rgba(0,0,0,0.2)",
              border: "none",
            }}
            rowSpan={hasGroupedHeaderLabel ? 2 : 1}
          >
            {actions}
            <CustomTableCellShadow shadowLeft />
          </TableCell>
        )}
      </TableRow>
      {hasGroupedHeaderLabel && (
        <TableRow>
          {configs.map((config) =>
            config.groupedHeaderLabel ? (
              <TableCell
                key={config.key.toString()}
                {...config.headerCellProps}
                sx={{
                  whiteSpace: "nowrap",
                  ...config.headerCellProps?.sx,
                  backgroundColor: "red",
                }}
              >
                <Stack
                  gap={1}
                  direction='row'
                  alignItems={"left"}
                  justifyContent={"flex-start"}
                >
                  {config.headerIcon}
                  {config.headerLabel}
                </Stack>
              </TableCell>
            ) : null
          )}
        </TableRow>
      )}
    </TableHead>
  );
}
