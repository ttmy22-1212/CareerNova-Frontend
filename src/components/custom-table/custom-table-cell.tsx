import { Edit } from "@mui/icons-material";
import {
  TableCellProps,
  TableCell,
  IconButton,
  Typography,
  Box,
} from "@mui/material";
import { Stack } from "@mui/system";
import { format } from "date-fns";
import { useState, useCallback, useMemo, ReactNode, useEffect } from "react";
import { CustomTableConfig } from "./custom-table.types";
import CustomTableCellShadow from "./cutom-table-cell-shadow";
import useFunction from "@/hooks/use-function";
import { getObjectValue } from "@/utils/obj-helper";

export function CustomTableCell<P, T extends { id: P; [key: string]: any }>({
  data,
  config,
  onUpdate,
  cellProps,
}: {
  data: T;
  config: CustomTableConfig<P, T>;
  onUpdate: (value: any) => Promise<any>;
  cellProps?: TableCellProps;
}) {
  const [editing, setEditing] = useState(false);
  const [editingValue, setEditingValue] = useState<any>();
  const [color, setColor] = useState("");

  const cellValue =
    typeof config.key === "string"
      ? getObjectValue(data, config.key)
      : data[config.key];

  const handleUpdate = useCallback(
    async (value: any): Promise<any> => {
      await onUpdate(value);
      setEditing(false);
    },
    [onUpdate]
  );

  const handleStartEdit = useCallback(() => {
    setEditing(true);
    setEditingValue(cellValue);
  }, [cellValue]);

  const handleCancelEdit = useCallback(() => setEditing(false), []);
  const handleUpdateHelper = useFunction(handleUpdate, {
    onSuccess: () => setColor("success.lightest"),
    onError: () => setColor("error.lightest"),
  });

  const content = useMemo((): ReactNode => {
    const customContent = config.renderCell ? config.renderCell(data) : null;
    if (
      customContent &&
      typeof customContent !== "string" &&
      typeof customContent !== "number"
    ) {
      return customContent;
    }
    const cellContent = customContent || cellValue;

    return config.renderCell ? (
      config.renderCell(data, handleStartEdit)
    ) : (
      <Typography variant='body2'>
        {config.type == "date"
          ? cellContent
            ? format(new Date(cellContent), "dd/MM/yyyy")
            : ""
          : config.type == "datetime"
          ? cellContent
            ? format(new Date(cellContent), "dd/MM/yyyy HH:mm")
            : ""
          : config.type == "number" || config.type == "float"
          ? cellContent
            ? Number(cellContent).toLocaleString("vi-VN")
            : "0"
          : String(cellContent || "")}
      </Typography>
    );
  }, [config, data, handleStartEdit, cellValue]);

  useEffect(() => {
    if (color) {
      setTimeout(() => setColor(""), 200);
    }
  }, [color]);

  if (editing && config.renderEditingCell) {
    return (
      <TableCell {...cellProps} {...config.cellProps}>
        {config.renderEditingCell(
          editingValue,
          setEditingValue,
          handleUpdateHelper.loading,
          cellValue || "",
          handleUpdateHelper.call,
          handleCancelEdit,
          config.type
        )}
        <CustomTableCellShadow
          shadowRight={config.shadowRight}
          shadowLeft={config.shadowLeft}
        />
      </TableCell>
    );
  }

  return (
    <TableCell
      align={
        config.type == "number" || config.type == "float" ? "right" : "left"
      }
      {...cellProps}
      sx={{
        bgcolor: color,
        transition: color ? undefined : "background-color ease 2s",
        px: 2,
        ...cellProps?.sx,
        overflow: "hidden",
        border: "none",
      }}
      {...config.cellProps}
    >
      {config.renderEditingCell ? (
        <Stack
          direction='row'
          alignItems='center'
          justifyContent='flex-end'
          sx={{ my: -1 }}
        >
          {content}
          <IconButton onClick={handleStartEdit} color='primary'>
            <Edit fontSize='small' />
          </IconButton>
        </Stack>
      ) : (
        <>{content}</>
      )}
      <CustomTableCellShadow
        shadowRight={config.shadowRight}
        shadowLeft={config.shadowLeft}
      />
    </TableCell>
  );
}
