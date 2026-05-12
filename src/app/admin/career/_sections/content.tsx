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

const jobs = [
  {
    id: 1,
    title: "Frontend Developer",
    department: "Engineering",
    location: "Hà Nội",
    type: "Toàn thời gian",
    applicants: 24,
    status: "Đang tuyển",
    postedDate: "15/04/2023",
  },
  {
    id: 2,
    title: "UX/UI Designer",
    department: "Design",
    location: "Hồ Chí Minh",
    type: "Toàn thời gian",
    applicants: 18,
    status: "Đang tuyển",
    postedDate: "20/04/2023",
  },
  {
    id: 3,
    title: "Product Manager",
    department: "Product",
    location: "Hà Nội",
    type: "Toàn thời gian",
    applicants: 12,
    status: "Đã đóng",
    postedDate: "10/03/2023",
  },
  {
    id: 4,
    title: "Backend Developer",
    department: "Engineering",
    location: "Đà Nẵng",
    type: "Toàn thời gian",
    applicants: 15,
    status: "Đang tuyển",
    postedDate: "05/04/2023",
  },
  {
    id: 5,
    title: "Marketing Specialist",
    department: "Marketing",
    location: "Hồ Chí Minh",
    type: "Bán thời gian",
    applicants: 8,
    status: "Đang tuyển",
    postedDate: "25/04/2023",
  },
];

const CareerContent = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };
  return (
    <Stack>
      <Stack
        direction='row'
        justifyContent='space-between'
        alignItems='center'
        sx={{ mb: 3 }}
      >
        <Typography variant='h4' fontWeight='bold'>
          Quản lý tuyển dụng
        </Typography>
        <Button variant='contained' startIcon={<AddIcon />}>
          Thêm vị trí
        </Button>
      </Stack>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant='h5' fontWeight='bold'>
                {jobs.length}
              </Typography>
              <Typography variant='body2'>Tổng số vị trí</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant='h5' fontWeight='bold'>
                {jobs.filter((job) => job.status === "Đang tuyển").length}
              </Typography>
              <Typography variant='body2'>Đang tuyển</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant='h5' fontWeight='bold'>
                {jobs.reduce((acc, job) => acc + job.applicants, 0)}
              </Typography>
              <Typography variant='body2'>Tổng số ứng viên</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer>
          <Table stickyHeader aria-label='sticky table'>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Vị trí</TableCell>
                <TableCell>Phòng ban</TableCell>
                <TableCell>Địa điểm</TableCell>
                <TableCell>Loại</TableCell>
                <TableCell>Ứng viên</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Ngày đăng</TableCell>
                <TableCell align='right'>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jobs
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((job) => (
                  <TableRow hover key={job.id}>
                    <TableCell>{job.id}</TableCell>
                    <TableCell>{job.title}</TableCell>
                    <TableCell>{job.department}</TableCell>
                    <TableCell>{job.location}</TableCell>
                    <TableCell>{job.type}</TableCell>
                    <TableCell>{job.applicants}</TableCell>
                    <TableCell>
                      <Chip
                        label={job.status}
                        color={
                          job.status === "Đang tuyển" ? "success" : "default"
                        }
                        size='small'
                      />
                    </TableCell>
                    <TableCell>{job.postedDate}</TableCell>
                    <TableCell align='right'>
                      <IconButton size='small' color='primary'>
                        <VisibilityIcon fontSize='small' />
                      </IconButton>
                      <IconButton size='small' color='primary'>
                        <EditIcon fontSize='small' />
                      </IconButton>
                      <IconButton size='small' color='error'>
                        <DeleteIcon fontSize='small' />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component='div'
          count={jobs.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Stack>
  );
};

export default CareerContent;
