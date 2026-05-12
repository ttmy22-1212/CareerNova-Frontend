import {
  Box,
  Button,
  CircularProgress,
  Stack,
  StackProps,
  Table,
  TableBody,
  TablePagination,
  Typography,
} from "@mui/material";
import { isValid } from "date-fns";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getObjectValue } from "@/utils/obj-helper";
import { CustomTableHeader } from "./custom-table-header";
import { CustomTableRow } from "./custom-table-row";
import { CustomTableProps, CustomTableSortModel } from "./custom-table.types";
import { Scrollbar } from "../scrollbar";
import useDragScroll from "@/hooks/use-drag-scroll";

export function CustomTable<P, T extends { id: P; [key: string]: any }>(
  props: CustomTableProps<P, T> & StackProps
) {
  const {
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
    renderBlurContent,
    ...stackProps
  } = props;

  const [_sortModel, setSortModel] = useState<CustomTableSortModel<P, T>>();
  const sortModel = onChangeSortModel ? customSortModel : _sortModel;
  const [isMounted, setIsMounted] = useState(false);
  const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null);
  const scrollBar = useRef<any>(null);
  const {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    isDragging,
    isClickDisabled,
  } = useDragScroll(scrollEl);

  const sortedRows = useMemo(() => {
    if (onChangeSortModel) {
      return rows;
    }
    const config = configs.find((c) => c.key == sortModel?.key);
    if (!sortModel || !config) {
      return rows;
    }

    const sortDirection = sortModel.direction == "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const valueA = getObjectValue(a, sortModel.key);
      const valueB = getObjectValue(b, sortModel.key);
      if (!valueA) return 1;
      if (!valueB) return -1;
      if (config.type == "date" || config.type == "datetime") {
        const dateA = new Date(valueA);
        const dateB = new Date(valueB);
        if (!isValid(dateA)) return 1;
        if (!isValid(dateB)) return -1;
        return (dateA.getTime() - dateB.getTime()) * sortDirection;
      }
      if (config.type == "number" || config.type == "float") {
        return (Number(valueA) - Number(valueB)) * sortDirection;
      }
      return String(valueA).localeCompare(String(valueB)) * sortDirection;
    });
  }, [configs, onChangeSortModel, rows, sortModel]);

  const pagedRows = useMemo(() => {
    return pagination
      ? sortedRows.slice(
          pagination.rowsPerPage * pagination.page,
          pagination.rowsPerPage * (pagination.page + 1)
        )
      : sortedRows;
  }, [pagination, sortedRows]);

  const handleClickSort = useCallback(
    (key: keyof T | string) => {
      const f = onChangeSortModel || setSortModel;
      if (key == sortModel?.key && sortModel.direction == "desc") {
        f(undefined);
      } else {
        f({
          key: key,
          direction: sortModel?.key != key ? "asc" : "desc",
        });
      }
    },
    [onChangeSortModel, sortModel?.direction, sortModel?.key]
  );

  useEffect(() => {
    setTimeout(() => setIsMounted(true), 1000);
    const interval = setInterval(() => scrollBar.current?.recalculate?.(), 200);
    setScrollEl(scrollBar.current?.contentWrapperEl);
    return () => clearInterval(interval);
  }, []);

  return (
    <Stack {...stackProps} sx={{ position: "relative", ...stackProps.sx }}>
      {children}
      <Scrollbar
        {...scrollbarProps}
        sx={{
          userSelect: "none",
          cursor: isDragging ? "grabbing" : undefined,
          maxHeight: "calc(100vh - 280px)",
          position: "relative",
          ...scrollbarProps?.sx,
          overflowY: renderBlurContent ? "hidden" : "auto",
        }}
        // ref={scrollBar}
        // onMouseDown={handleMouseDown}
        // onMouseMove={handleMouseMove}
        // onMouseUp={handleMouseUp}
        // onMouseLeave={handleMouseLeave}
      >
        <Table
          {...tableProps}
          sx={{
            minWidth: 700,
            // display: isMounted ? "inline-table" : undefined,
            position: "relative",
            tableLayout: isMounted && flexible ? "fixed" : undefined,
            transition: "opacity 0.1s ease",
            ...(props.loading
              ? {
                  pointerEvents: "none",
                  opacity: 0.5,
                }
              : {}),
            ...tableProps?.sx,
          }}
        >
          {isClickDisabled && (
            <div
              style={{
                height: "100%",
                width: "100%",
                position: "absolute",
                top: 0,
                left: 0,
                zIndex: 1,
              }}
            />
          )}
          <CustomTableHeader
            {...props}
            sortModel={onChangeSortModel ? customSortModel : sortModel}
            onClickSort={handleClickSort}
          />
          <TableBody>
            {additionalTopRow}
            {pagedRows.length == 0 && loading && LoadingSkeleton && (
              <>
                {Array(5)
                  .fill(0)
                  .map((_, index) => (
                    <LoadingSkeleton key={index} />
                  ))}
              </>
            )}
            {pagedRows.map((row, index) => (
              <CustomTableRow
                key={row.id + "-key-" + index}
                {...props}
                isDragging={isDragging && isClickDisabled}
                row={row}
                index={index}
              />
            ))}
            {additionalBottomRow}
          </TableBody>
        </Table>
        {((loading && !LoadingSkeleton) || rows.length == 0) && (
          <Stack height={!emptyState ? 104 : 350} />
        )}
      </Scrollbar>
      {renderBlurContent && (
        <Box
          position={"absolute"}
          top={0}
          left={0}
          right={0}
          bottom={0}
          zIndex={20}
          sx={{
            pointerEvents: "all",
            userSelect: "none",
            backdropFilter: "blur(5px)",
          }}
        >
          {renderBlurContent()}
        </Box>
      )}
      {(loading || rows.length == 0) && (
        <Stack
          marginTop={!emptyState ? -12 : 0}
          height={!emptyState ? 100 : 0}
          width={"100%"}
          alignItems='center'
          justifyContent='center'
          position='sticky'
          left={0}
          top={props.loading ? 12 : undefined}
        >
          {loading ? (
            LoadingSkeleton ? null : (
              <CircularProgress />
            )
          ) : emptyState ? (
            emptyState
          ) : (
            <Typography variant='subtitle1'>No data</Typography>
          )}
        </Stack>
      )}
      {pagination && (
        <TablePagination
          component='div'
          {...pagination}
          count={pagination.count}
          rowsPerPageOptions={rowsPerPageOptions || [5, 10, 25]}
        />
      )}
    </Stack>
  );
}
