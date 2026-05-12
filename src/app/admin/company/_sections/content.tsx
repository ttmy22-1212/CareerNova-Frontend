import type React from "react";

import { useState } from "react";
import {
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";

const companies = [
  {
    id: 1,
    name: "Tech Solutions Inc.",
    industry: "Công nghệ",
    employees: 250,
    location: "Hà Nội",
    status: "Hoạt động",
  },
  {
    id: 2,
    name: "Green Energy Co.",
    industry: "Năng lượng",
    employees: 120,
    location: "Hồ Chí Minh",
    status: "Hoạt động",
  },
  {
    id: 3,
    name: "Global Logistics",
    industry: "Vận tải",
    employees: 500,
    location: "Đà Nẵng",
    status: "Tạm ngưng",
  },
  {
    id: 4,
    name: "Food & Beverage Group",
    industry: "Thực phẩm",
    employees: 300,
    location: "Hà Nội",
    status: "Hoạt động",
  },
  {
    id: 5,
    name: "Healthcare Solutions",
    industry: "Y tế",
    employees: 180,
    location: "Hồ Chí Mi",
    status: "Hoạt động",
  },
];

const CompanyContent = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Stack>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Typography variant="h4" fontWeight="bold">
          Quản lý công ty
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          Thêm công ty
        </Button>
      </Stack>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" fontWeight="bold">
                {companies.length}
              </Typography>
              <Typography variant="body2">Tổng số công ty</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" fontWeight="bold">
                {companies.filter((c) => c.status === "Hoạt động").length}
              </Typography>
              <Typography variant="body2">Đang hoạt động</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" fontWeight="bold">
                {companies.reduce((acc, company) => acc + company.employees, 0)}
              </Typography>
              <Typography variant="body2">Tổng số nhân viên</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Tên công ty</TableCell>
                <TableCell>Ngành nghề</TableCell>
                <TableCell>Số nhân viên</TableCell>
                <TableCell>Địa điểm</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {companies
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((company) => (
                  <TableRow hover key={company.id}>
                    <TableCell>{company.id}</TableCell>
                    <TableCell>{company.name}</TableCell>
                    <TableCell>{company.industry}</TableCell>
                    <TableCell>{company.employees}</TableCell>
                    <TableCell>{company.location}</TableCell>
                    <TableCell>
                      <Chip
                        label={company.status}
                        color={
                          company.status === "Hoạt động" ? "success" : "warning"
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" color="primary">
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="primary">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={companies.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Stack>
  );
};

export default CompanyContent;
