import { Clear, Edit, Warning } from "@mui/icons-material";
import {
  Button,
  Checkbox,
  IconButton,
  Stack,
  StackProps,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { CustomTableCell } from "./custom-table-cell";
import { CustomTableProps } from "./custom-table.types";
import { useMemo } from "react";
import CustomTableCellShadow from "./cutom-table-cell-shadow";

export function CustomTableRow<P, T extends { id: P; [key: string]: any }>(
  props: CustomTableProps<P, T> &
    StackProps & { isDragging: boolean; index: number; row: T },
) {
  const {
    isDragging,
    index,
    row,
    rows,
    configs,
    actions,
    renderRowActions,
    cellProps,
    tableProps,
    scrollbarProps,
    children,
    onClickRow,
    onClickEdit,
    onClickDelete,
    onClickDetail,
    onUpdate,
    indexColumn,
    stickyIndex,
    select,
    pagination,
    additionalTopRow,
    additionalBottomRow,
    loading,
    flexible,
    emptyState,
    sortModel: customSortModel,
    getRowProps,
    onChangeSortModel,
    LoadingSkeleton,
    rowsPerPageOptions,
    ...stackProps
  } = props;

  const rowProps = useMemo(() => {
    const props = getRowProps?.(row, index) || {};
    props.hover = !!onClickRow || !!(props as any).href;
    if (isDragging) {
      props.component = undefined;
      (props as any).href = undefined;
    }
    return props;
  }, [getRowProps, index, isDragging, onClickRow, row]);

  if (loading && LoadingSkeleton) {
    return <LoadingSkeleton key={row.id} />;
  }

  return (
    <TableRow
      hover={!!onClickRow || !!(rowProps as any).href}
      onClick={onClickRow ? () => onClickRow(row, index) : undefined}
      {...rowProps}
      sx={{
        whiteSpace: "nowrap",
        px: 2,
        bgcolor: row.error ? "error.lightest" : undefined,
        cursor: onClickRow ? "pointer" : undefined,
        borderBottom: "1px solid",
        borderColor: "divider",
        // transition: "background 0s",
        ...(rowProps.hover
          ? { "&:hover > .MuiTableCell-root": { bgcolor: "primary.lightest" } }
          : {}),
        ...(rowProps.sx || {}),
      }}
    >
      {(indexColumn || select) && (
        <TableCell
          onClick={(e) => e.stopPropagation()}
          {...cellProps}
          sx={{
            border: "none",
            maxWidth: 60,
            minWidth: 40,
            textAlign: "center", // Căn giữa số thứ tự,
            position: stickyIndex ? "sticky" : "static",
            left: 0,
            backgroundColor: "white",
            zIndex: 10,
          }}
        >
          <Stack
            direction="row"
            gap={1}
            alignItems="center"
            justifyContent="center"
          >
            {select && (
              <Checkbox
                sx={{ my: -1, mx: -0.5 }}
                checked={select.selected.includes(row)}
                onChange={(e, checked) =>
                  checked
                    ? select.handleSelectOne(row)
                    : select.handleDeselectOne(row)
                }
              />
            )}
            {indexColumn && <Typography>{index + 1}</Typography>}
            {row.error && (
              <Tooltip title={row.error}>
                <Warning color="error" />
              </Tooltip>
            )}
          </Stack>
        </TableCell>
      )}
      {configs.map((config) => (
        <CustomTableCell
          key={config.key.toString()}
          cellProps={cellProps}
          data={row}
          config={config}
          onUpdate={async (value) =>
            await onUpdate?.(config.key, value, row, index)
          }
        />
      ))}

      {(onClickDelete || onClickDetail || onClickEdit || renderRowActions) && (
        <TableCell
          align="right"
          onClick={(e) => e.stopPropagation()}
          sx={{
            position: "sticky",
            right: 0,
            backgroundColor: "white",
            zIndex: 10,
            border: "none",
            boxShadow: "-2px 0 5px -2px rgba(0,0,0,0.2)",
          }}
        >
          <Stack
            direction="row"
            justifyContent="flex-end"
            flex={1}
            my={-0.5}
            pr={1}
          >
            {renderRowActions?.(row, index)}
            {onClickEdit && (
              <IconButton onClick={() => onClickEdit(row, index)}>
                <Edit sx={{ height: "20px", width: "20px" }} color="primary" />
              </IconButton>
            )}
            {onClickDelete && (
              <IconButton onClick={() => onClickDelete(row, index)}>
                <Clear sx={{ height: "20px", width: "20px" }} color="error" />
              </IconButton>
            )}
            {onClickDetail && (
              <Button
                variant="outlined"
                color="primary"
                onClick={() => onClickDetail(row, index)}
                size="small"
              >
                Chi tiết
              </Button>
            )}
          </Stack>
          <CustomTableCellShadow shadowLeft />
        </TableCell>
      )}
    </TableRow>
  );
}
