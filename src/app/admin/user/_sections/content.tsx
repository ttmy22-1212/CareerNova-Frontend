import type React from "react";

import { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SearchIcon from "@mui/icons-material/Search";

const users = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    role: "Admin",
    status: "Hoạt động",
    lastLogin: "25/04/2023 10:30",
  },
  {
    id: 2,
    name: "Trần Thị B",
    email: "tranthib@example.com",
    role: "User",
    status: "Hoạt động",
    lastLogin: "24/04/2023 15:45",
  },
  {
    id: 3,
    name: "Lê Văn C",
    email: "levanc@example.com",
    role: "Editor",
    status: "Không hoạt động",
    lastLogin: "20/04/2023 09:15",
  },
  {
    id: 4,
    name: "Phạm Thị D",
    email: "phamthid@example.com",
    role: "User",
    status: "Hoạt động",
    lastLogin: "23/04/2023 14:20",
  },
  {
    id: 5,
    name: "Hoàng Văn E",
    email: "hoangvane@example.com",
    role: "User",
    status: "Bị khóa",
    lastLogin: "15/04/2023 11:10",
  },
];

const UserContent = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <Stack>
      <Stack
        direction='row'
        justifyContent='space-between'
        alignItems='center'
        sx={{ mb: 3 }}
      >
        <Typography variant='h4' fontWeight='bold'>
          Quản lý người dùng
        </Typography>
        <Button variant='contained' startIcon={<AddIcon />}>
          Thêm người dùng
        </Button>
      </Stack>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant='h5' fontWeight='bold'>
                {users.length}
              </Typography>
              <Typography variant='body2'>Tổng số người dùng</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant='h5' fontWeight='bold'>
                {users.filter((user) => user.status === "Hoạt động").length}
              </Typography>
              <Typography variant='body2'>Đang hoạt động</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant='h5' fontWeight='bold'>
                {users.filter((user) => user.role === "Admin").length}
              </Typography>
              <Typography variant='body2'>Quản trị viên</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            placeholder='Tìm kiếm người dùng...'
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            size='small'
          />
        </Box>
        <TableContainer>
          <Table stickyHeader aria-label='sticky table'>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Người dùng</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Vai trò</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Đăng nhập cuối</TableCell>
                <TableCell align='right'>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow hover key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>
                      <Stack direction='row' spacing={2} alignItems='center'>
                        <Avatar>{user.name.charAt(0)}</Avatar>
                        <Typography variant='body2'>{user.name}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{user?.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        color={user.role === "Admin" ? "primary" : "default"}
                        size='small'
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.status}
                        color={
                          user.status === "Hoạt động"
                            ? "success"
                            : user.status === "Bị khóa"
                            ? "error"
                            : "default"
                        }
                        size='small'
                      />
                    </TableCell>
                    <TableCell>{user.lastLogin}</TableCell>
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
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Stack>
  );
};

export default UserContent;
