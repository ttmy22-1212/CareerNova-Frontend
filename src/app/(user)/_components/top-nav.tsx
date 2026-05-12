"use client";

import type React from "react";

import { useCallback, useMemo, useState, useEffect } from "react";
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  IconButton,
  ListItemButton,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";
import MoreIcon from "@mui/icons-material/MoreVert";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import MapIcon from "@mui/icons-material/Map";
import ForumIcon from "@mui/icons-material/Forum";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import CloseIcon from "@mui/icons-material/Close";
import { paths } from "@/paths";
import Link from "next/link";
import RowStack from "@/components/row-stack";
import { getNavConfig } from "./get-nav-config";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth/firebase-context";
import {
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";

type TopNavProps = {};

// Map of icons for navigation items
const navIcons: Record<string, React.ReactNode> = {
  "Trang chủ": <HomeIcon />,
  "Phân tích nghề": <AnalyticsIcon />,
  "Lộ trình": <MapIcon />,
  "Diễn đàn": <ForumIcon />,
};

const TopNav = ({}: TopNavProps) => {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] =
    useState<null | HTMLElement>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const configNav = useMemo(() => getNavConfig(), []);
  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  // Close drawer when screen size changes from mobile to desktop
  useEffect(() => {
    if (!isMobile) {
      setDrawerOpen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    // Auto close menu mobile on route change
    setDrawerOpen(false);
  }, [pathname]);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
    setMobileMoreAnchorEl(null);
  }, [setAnchorEl, setMobileMoreAnchorEl]);

  const handleMobileMenuOpen = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      setMobileMoreAnchorEl(event.currentTarget);
    },
    [setMobileMoreAnchorEl],
  );

  const handleDrawerToggle = useCallback(() => {
    setDrawerOpen((prev) => !prev);
  }, []);

  const handleNavItemClick = useCallback(
    (href: string) => {
      router.push(href);
      setDrawerOpen(false);
    },
    [router],
  );

  const isActive = useCallback(
    (href: string) => {
      return pathname.startsWith(href);
    },
    [pathname],
  );

  const menuId = "primary-search-account-menu";
  const mobileMenuId = "primary-search-account-menu-mobile";

  // Check if a nav item is active

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: "background.paper",
          boxShadow: {
            xs: "0px 4px 12px rgba(0, 0, 0, 0.2)", // 🔥 tăng bóng cho mobile
            md: "0px 4px 12px rgba(0, 0, 0, 0.1)", // hoặc giữ nguyên với desktop
          },
          transition: (theme) =>
            theme.transitions.create(["width", "margin"], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", px: { xs: 1, md: 2 } }}>
          <Link href={paths.dashboard}>
            <Box
              component={"img"}
              src="/images/logo-transparent.png"
              width={isMobile ? 100 : 120}
              height={isMobile ? 40 : 48}
              sx={{
                objectFit: "cover",
                cursor: "pointer",
              }}
            />
          </Link>
          {/* Center section: Navigation links (desktop only) */}
          {!isMobile && (
            <RowStack sx={{ flexGrow: 1 }} gap={2} justifyContent={"center"}>
              {configNav.map(({ title, href }, index) => (
                <Stack
                  key={index}
                  onClick={() => router.push(href)}
                  sx={{
                    cursor: "pointer",
                    position: "relative",
                    px: 1,
                    py: 0.5,
                    "&:after": isActive(href)
                      ? {
                          content: '""',
                          position: "absolute",
                          bottom: -8,
                          left: 0,
                          width: "100%",
                          height: 3,
                          bgcolor: "primary.main",
                          borderRadius: "3px 3px 0 0",
                        }
                      : {},
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.05)",
                    },
                  }}
                >
                  <Typography
                    color={isActive(href) ? "primary.main" : "secondary.main"}
                    fontWeight={isActive(href) ? 500 : 400}
                  >
                    {title}
                  </Typography>
                </Stack>
              ))}
            </RowStack>
          )}

          {/* Right section: User actions */}
          <RowStack spacing={1}>
            {user?.email ? (
              <>
                {/* Desktop view */}
                <Box sx={{ display: { xs: "none", md: "flex" } }}>
                  {/* <IconButton size="large" aria-label="show 4 new notifications" color="inherit">
                    <Badge badgeContent={4} color="error">
                      <NotificationsIcon />
                    </Badge>
                  </IconButton> */}
                  <IconButton
                    size="large"
                    edge="end"
                    aria-label="account of current user"
                    aria-controls={menuId}
                    aria-haspopup="true"
                    onClick={handleProfileMenuOpen}
                    color="inherit"
                  >
                    {/* <Box
                      component={'img'}src={user?.photo_url || ""}
                      width={32} height={32}
                    /> */}
                    <Avatar
                      sx={{ width: 32, height: 32 }}
                      src={user?.photo_url || ""}
                    >
                      {user?.email?.charAt(0).toUpperCase() || "?"}
                    </Avatar>
                  </IconButton>
                </Box>
                {/* Mobile view */}
                <Box sx={{ display: { xs: "flex", md: "none" } }}>
                  <IconButton
                    size="large"
                    aria-label="show more"
                    aria-controls={mobileMenuId}
                    aria-haspopup="true"
                    onClick={handleMobileMenuOpen}
                    color="inherit"
                  >
                    <MoreIcon />
                  </IconButton>
                </Box>
              </>
            ) : (
              <Button
                variant="contained"
                onClick={() =>
                  router.push(paths.auth.login + `?returnTo=${pathname}`)
                }
                size="medium"
                sx={{
                  display: { xs: "none", md: "inline-flex" }, // Ẩn trên mobile
                  whiteSpace: "nowrap",
                  px: 2,
                }}
              >
                Đăng nhập
              </Button>
            )}
          </RowStack>
          {isMobile && (
            <RowStack gap={1}>
              <Button
                variant="contained"
                onClick={() =>
                  router.push(paths.auth.login + `?returnTo=${pathname}`)
                }
                size="medium"
                sx={{
                  display: { xs: "none", md: "inline-flex" }, // Ẩn trên mobile
                  whiteSpace: "nowrap",
                  px: 2,
                }}
              >
                Đăng nhập
              </Button>
              <IconButton
                color="secondary"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 0.5 }}
              >
                <MenuIcon />
              </IconButton>
            </RowStack>
          )}
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        id={menuId}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={isMenuOpen}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            router.push(paths.profile.detail);
            handleMenuClose();
          }}
        >
          Hồ sơ
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleMenuClose();
            signOut();
          }}
        >
          Đăng xuất
        </MenuItem>
      </Menu>

      {/* Mobile Menu */}
      <Menu
        anchorEl={mobileMoreAnchorEl}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        id={mobileMenuId}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={isMobileMenuOpen}
        onClose={() => setMobileMoreAnchorEl(null)}
      >
        <MenuItem>
          <IconButton
            size="large"
            aria-label="show 4 new notifications"
            color="inherit"
          >
            <Badge badgeContent={4} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <p>Thông báo</p>
        </MenuItem>
        <MenuItem>
          <IconButton size="large" aria-label="settings" color="inherit">
            <SettingsIcon />
          </IconButton>
          <p>Cài đặt</p>
        </MenuItem>
        <MenuItem onClick={handleProfileMenuOpen}>
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="primary-search-account-menu"
            aria-haspopup="true"
            color="inherit"
          >
            <AccountCircleIcon />
          </IconButton>
          <p>Hồ sơ</p>
        </MenuItem>
      </Menu>

      {/* Mobile Navigation Drawer */}
      <Drawer
        anchor="right"
        variant="temporary"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 280,
            bgcolor: "background.paper",
          },
        }}
      >
        <Box
          sx={{
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6" component="div">
            Menu
          </Typography>
          <IconButton onClick={handleDrawerToggle}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <List>
          {configNav.map(({ title, href }, index) => {
            // Map icons to navigation items
            let icon;
            switch (title) {
              case "Trang chủ":
                icon = <HomeIcon />;
                break;
              case "Phân tích nghề":
                icon = <AnalyticsIcon />;
                break;
              case "Lộ trình":
                icon = <MapIcon />;
                break;
              case "Diễn đàn":
                icon = <ForumIcon />;
                break;
              default:
                icon = <HomeIcon />;
            }

            return (
              <ListItemButton
                key={index}
                component={Link}
                href={href}
                selected={isActive(href)}
                sx={{ textAlign: "left" }}
              >
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText primary={title} />
              </ListItemButton>
            );
          })}
        </List>
        <Divider />
        {user?.email ? (
          <List>
            <ListItemButton
              component="button"
              onClick={() => router.push(paths.profile.detail)}
            >
              <ListItemIcon>
                <AccountCircleIcon />
              </ListItemIcon>
              <ListItemText primary="Hồ sơ" />
            </ListItemButton>

            {/* <ListItemButton
              component="button"
              onClick={() => router.push("/settings")}
            >
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Cài đặt" />
            </ListItemButton> */}

            <ListItemButton component="button" onClick={signOut}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Đăng xuất" />
            </ListItemButton>
          </List>
        ) : (
          <Box sx={{ p: 2 }}>
            <Button
              variant="contained"
              fullWidth
              onClick={() => {
                router.push(paths.auth.login + `?returnTo=${pathname}`);
                setDrawerOpen(false);
              }}
            >
              Đăng nhập
            </Button>
          </Box>
        )}
      </Drawer>
    </>
  );
};

export default TopNav;
