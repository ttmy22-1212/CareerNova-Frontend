"use client"
import { Avatar, Box, Button, Card, CardContent, Divider, Typography } from "@mui/material"
import { AddCircleOutline } from "@mui/icons-material"
import { useEffect, useState } from "react"
import UsersApi from "@/api/users"
import type { User } from "@/types/user"

export default function ProfileSidebar() {
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userData = await UsersApi.me()
                setUser(userData)
            } catch (error) {
                console.error("Error fetching user data:", error)
            }
        }
        fetchUserData()
    }, [])

    return (
        <Card
            sx={{
                bgcolor: "#f5f5f5",
                height: { xs: "400px", md: "100%" },
                p: { xs: 1, md: 5 },
                overflow: { xs: "auto", md: "visible" },
            }}
        >
            <CardContent
                sx={{
                    p: { xs: 1, md: 5 },
                }}
            >
                <Box
                    sx={{
                        bgcolor: "primary.secondary",
                        p: { xs: 1, md: 2 },
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        height: { xs: "auto", md: "auto" },
                        overflow: { xs: "auto", md: "visible" },
                    }}
                >
                    <Avatar
                        src={user?.photo_url}
                        alt={user?.name || "Unknown User"}
                        sx={{
                            width: { xs: 50, md: 80 },
                            height: { xs: 50, md: 80 },
                            mb: { xs: 0.5, md: 1 },
                        }}
                    />
                    <Typography
                        variant="h6"
                        fontWeight="bold"
                        sx={{
                            fontSize: { xs: "0.875rem", md: "1.25rem" },
                        }}
                    >
                        {user?.name || "Unknown User"}
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                        sx={{
                            fontSize: { xs: "0.75rem", md: "1rem" },
                        }}
                    >
                        {user?.address}
                    </Typography>

                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<AddCircleOutline />}
                        sx={{
                            textTransform: "none",
                            borderColor: "#e0e0e0",
                            color: "text.secondary",
                            bgcolor: "white",
                            my: { xs: 0.5, md: 1 },
                            width: "100%",
                            justifyContent: "flex-start",
                            fontSize: { xs: "0.625rem", md: "0.875rem" },
                            p: { xs: 0.5, md: 1 },
                        }}
                    >
                        Kinh nghiệm
                    </Button>
                </Box>

                <Divider sx={{ my: { xs: 0.5, md: 2 } }} />

                <Box
                    sx={{
                        p: { xs: 1, md: 2 },
                    }}
                >
                    <Typography
                        variant="body2"
                        fontWeight="medium"
                        gutterBottom
                        sx={{
                            fontSize: { xs: "0.75rem", md: "1rem" },
                        }}
                    >
                        Kết nối
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            fontSize: { xs: "0.625rem", md: "0.875rem" },
                            height: { xs: "auto", md: "auto" },
                        }}
                    >
                        Mở rộng mạng lưới của bạn
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    )
}
