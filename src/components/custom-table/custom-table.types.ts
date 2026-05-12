import { TableCellProps, TableProps, TableRowProps } from "@mui/material";
import { FC, ReactNode } from "react";
import { ScrollbarProps } from "../scrollbar";
import { Selection } from "@/hooks/use-selection";
import { UsePaginationResult } from "@/hooks/use-pagination";

export type CustomTableEditCellProps<
  P,
  T extends { id: P; [key: string]: any }
> = (
  editingValue: any,
  onChange: (value: any) => void,
  updating: boolean,
  initialValue: any,
  onUpdate: (value: any) => Promise<any>,
  onCancel: () => void,
  type?: "string" | "number" | "date" | "datetime" | "float"
) => ReactNode;

export interface CustomTableConfig<P, T extends { id: P; [key: string]: any }> {
  key: keyof T | string;
  sortable?: boolean;
  headerLabel: string;
  groupedHeaderLabel?: string;
  headerIcon?: ReactNode;
  suffixIcon?: ReactNode;
  type?: "string" | "number" | "date" | "datetime" | "float";
  headerCellProps?: TableCellProps;
  renderCell?: (cellData: T, onEdit?: () => void) => ReactNode;
  renderEditingCell?: CustomTableEditCellProps<P, T>;
  cellProps?: TableCellProps;
  textAlign?: "left" | "center" | "right";
  width?: number | string | object;
  shadowLeft?: boolean;
  shadowRight?: boolean;
}

export interface CustomTableSortModel<
  P,
  T extends { id: P; [key: string]: any }
> {
  key: keyof T | string;
  direction: "asc" | "desc";
}

export interface CustomTableProps<P, T extends { id: P; [key: string]: any }> {
  rows: T[];
  configs: CustomTableConfig<P, T>[];
  actions?: ReactNode;
  renderRowActions?: (item: T, index: number) => ReactNode;
  cellProps?: TableCellProps;
  tableProps?: TableProps;
  scrollbarProps?: ScrollbarProps;
  children?: ReactNode;
  onClickRow?: (item: T, index: number) => void;
  onClickEdit?: (item: T, index: number) => void;
  onClickDelete?: (item: T, index: number) => void;
  onClickDetail?: (item: T, index: number) => void;
  onUpdate?: (key: keyof T, value: any, item: T, index: number) => Promise<any>;
  indexColumn?: boolean;
  stickyIndex?: boolean;
  select?: Selection<T>;
  pagination?: UsePaginationResult;
  stickyHeader?: boolean;
  additionalTopRow?: ReactNode;
  additionalBottomRow?: ReactNode;
  loading?: boolean;
  flexible?: boolean;
  emptyState?: ReactNode;
  sortModel?: CustomTableSortModel<P, T>;
  onChangeSortModel?: (sortModel?: CustomTableSortModel<P, T>) => void;
  LoadingSkeleton?: FC<any>;
  getRowProps?: (item: T, index: number) => TableRowProps;
  rowsPerPageOptions?: number[];
  frozenLastColumns?: number;
  renderBlurContent?: () => ReactNode;
}
