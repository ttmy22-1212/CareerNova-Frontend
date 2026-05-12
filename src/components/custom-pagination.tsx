import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import {
  FormControl,
  IconButton,
  MenuItem,
  Pagination,
  Select,
  SelectChangeEvent,
  Stack,
  StackProps,
  Theme,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { type FC } from "react";
import { UsePaginationResult } from "@/hooks/use-pagination";

interface CustomPaginationProps extends StackProps {
  pagination: UsePaginationResult;
  rowsPerPageOptions: number[];
  loginRequired?: boolean;
}

const CustomPagination: FC<CustomPaginationProps> = ({
  pagination,
  rowsPerPageOptions,
  loginRequired,
  ...StackProps
}) => {
  const isXs = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));

  return (
    <Stack
      direction='row'
      {...StackProps}
      gap={3}
      flexWrap='wrap'
      sx={{
        justifyContent: {
          xs: "center",
          sm: "flex-end",
        },
      }}
    >
      <Stack justifyContent='center' direction='row' gap={0.5}>
        <IconButton
          color='secondary'
          sx={{ borderRadius: 1 }}
          disabled={pagination.page == 0}
          onClick={(e) => pagination.onPageChange(e, pagination.page - 1)}
        >
          <KeyboardArrowLeft sx={{ width: 32, height: 32 }} />{" "}
        </IconButton>
        {pagination.count > 0 ? (
          <Pagination
            count={Math.ceil(pagination.count / pagination.rowsPerPage)}
            page={pagination.page + 1}
            onChange={(event: any, page: number) => {
              pagination.onPageChange(event, page - 1);
            }}
            siblingCount={isXs ? 0 : 1}
            size={isXs ? "small" : "large"}
            shape='rounded'
            color='primary'
            hideNextButton
            hidePrevButton
            sx={{
              display: "inline-flex",
              justifyContent: "center",
              "& > ul": {
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
                p: 0.5,
              },
            }}
          />
        ) : (
          <Stack justifyContent={"center"} alignItems={"center"} gap={1}>
            <Typography variant='subtitle1'>
              Trang {pagination.page + 1}
            </Typography>
          </Stack>
        )}
        <IconButton
          color='secondary'
          sx={{ borderRadius: 1 }}
          disabled={pagination.page == pagination.totalPages - 1}
          onClick={(e) => {
            pagination.onPageChange(e, pagination.page + 1);
          }}
        >
          <KeyboardArrowRight sx={{ width: 32, height: 32 }} />
        </IconButton>
      </Stack>
      <FormControl sx={{ minWidth: 120 }}>
        <Select
          inputProps={{ "aria-label": "Without label" }}
          value={String(pagination.rowsPerPage)}
          onChange={(event: SelectChangeEvent) =>
            pagination.onRowsPerPageChange(Number(event.target.value))
          }
        >
          {rowsPerPageOptions.map((option, index) => (
            <MenuItem key={index} value={option}>
              {option} / trang
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
};

export default CustomPagination;
