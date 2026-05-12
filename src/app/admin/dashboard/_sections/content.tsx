import {
  Box,
  Card,
  CardContent,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PeopleIcon from "@mui/icons-material/People";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import BusinessIcon from "@mui/icons-material/Business";

const DashboardContent = () => {
  return (
    <Stack>
      <Typography variant='h4' fontWeight='bold' sx={{ mb: 3 }}>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Stack
                direction='row'
                justifyContent='space-between'
                alignItems='center'
              >
                <Box>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Tổng doanh thu
                  </Typography>
                  <Typography variant='h5' fontWeight='bold'>
                    $24,000
                  </Typography>
                  <Typography
                    variant='body2'
                    color='success.main'
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <TrendingUpIcon fontSize='small' sx={{ mr: 0.5 }} />
                    +12%
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: "50%",
                    bgcolor: "primary.light",
                    color: "primary.main",
                    display: "flex",
                  }}
                >
                  <AttachMoneyIcon />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Stack
                direction='row'
                justifyContent='space-between'
                alignItems='center'
              >
                <Box>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Người dùng mới
                  </Typography>
                  <Typography variant='h5' fontWeight='bold'>
                    1,234
                  </Typography>
                  <Typography
                    variant='body2'
                    color='success.main'
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <TrendingUpIcon fontSize='small' sx={{ mr: 0.5 }} />
                    +8.5%
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: "50%",
                    bgcolor: "success.light",
                    color: "success.main",
                    display: "flex",
                  }}
                >
                  <PeopleIcon />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Stack
                direction='row'
                justifyContent='space-between'
                alignItems='center'
              >
                <Box>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Đơn hàng
                  </Typography>
                  <Typography variant='h5' fontWeight='bold'>
                    567
                  </Typography>
                  <Typography
                    variant='body2'
                    color='success.main'
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <TrendingUpIcon fontSize='small' sx={{ mr: 0.5 }} />
                    +5.2%
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: "50%",
                    bgcolor: "warning.light",
                    color: "warning.main",
                    display: "flex",
                  }}
                >
                  <ShoppingCartIcon />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Stack
                direction='row'
                justifyContent='space-between'
                alignItems='center'
              >
                <Box>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Công ty
                  </Typography>
                  <Typography variant='h5' fontWeight='bold'>
                    42
                  </Typography>
                  <Typography
                    variant='body2'
                    color='success.main'
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <TrendingUpIcon fontSize='small' sx={{ mr: 0.5 }} />
                    +3.7%
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: "50%",
                    bgcolor: "info.light",
                    color: "info.main",
                    display: "flex",
                  }}
                >
                  <BusinessIcon />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: "400px" }}>
            <Typography variant='h6' fontWeight='bold' sx={{ mb: 2 }}>
              Thống kê hoạt động
            </Typography>
            <Box
              sx={{
                height: "320px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant='body1' color='text.secondary'>
                Biểu đồ thống kê sẽ hiển thị ở đây
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: "400px" }}>
            <Typography variant='h6' fontWeight='bold' sx={{ mb: 2 }}>
              Hoạt động gần đây
            </Typography>
            <Stack spacing={2}>
              {[1, 2, 3, 4, 5].map((item) => (
                <Box key={item} sx={{ py: 1, borderBottom: "1px solid #eee" }}>
                  <Typography variant='body2' fontWeight='medium'>
                    Người dùng mới đăng ký
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    2 giờ trước
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default DashboardContent;
