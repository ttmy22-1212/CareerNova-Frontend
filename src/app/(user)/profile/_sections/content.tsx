"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  IconButton,
  Tab,
  Tabs,
  Typography,
  Stack,
} from "@mui/material";
import {
  Email,
  LocationOn,
  Message,
  Phone,
  Share,
  Edit,
  Delete,
  Verified,
  School,
  FormatQuote,
  Description,
} from "@mui/icons-material";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import LanguageIcon from "@mui/icons-material/Language"; // For social_media.other
import RowStack from "@/components/row-stack";
import Grid from "@mui/material/Grid";

// Import hooks and forms
import { useDialog } from "@/hooks/use-dialog";

// Import API and types
import UsersApi from "@/api/users";
import type { User, UserTopicProgress } from "@/types/user";
import EditProfileForm from "./edit-profile-form";
import EditCoursesForm from "./edit-courses-form";
import EditSkillsForm from "./edit-skills-form";

const isValidObjectId = (id: string): boolean => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

const ProfileContent = () => {
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<UserTopicProgress[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Dialog hooks for skills and courses
  const coursesDialog = useDialog();
  const skillsDialog = useDialog();

  // Fetch user data and topics on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [userData, topics] = await Promise.all([
          UsersApi.me(),
          UsersApi.getUserTopics(),
        ]);
        setUser(userData);
        setCourses(
          topics
            .filter((topic) => isValidObjectId(topic.topic_id))
            .map((topic) => ({
              ...topic,
              started_at: topic.started_at
                ? new Date(topic.started_at)
                : undefined,
              completed_at: topic.completed_at
                ? new Date(topic.completed_at)
                : undefined,
            })),
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle tab change for skills section
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle courses submit
  const handleCoursesSubmit = (newCourses: UserTopicProgress[]) => {
    setCourses(newCourses.filter((course) => isValidObjectId(course.topic_id)));
  };

  // Handle skills submit
  const handleSkillsSubmit = async (newSkills: string[]) => {
    try {
      const updatedUser = await UsersApi.addOrUpdateSkills({
        skills: newSkills,
      });
      setUser((prev) =>
        prev ? { ...prev, skills: updatedUser.skills || [] } : prev,
      );
    } catch (error) {
      console.error("Error updating skills:", error);
    }
  };

  // Handle profile submit
  const handleProfileSubmit = (profile: Partial<User>) => {
    UsersApi.updateProfile(profile)
      .then((updatedUser) => {
        setUser((prev) => (prev ? { ...prev, ...updatedUser } : prev));
        setIsEditingProfile(false);
      })
      .catch((error) => {
        console.error("Error updating profile:", error);
      });
  };

  // Handle delete topic progress
  const handleDeleteTopicProgress = async (topicId: string) => {
    if (!isValidObjectId(topicId)) {
      console.error("Invalid topicId:", topicId);
      return;
    }
    const confirmDelete = window.confirm("Bạn có chắc muốn xóa lộ trình này?");
    if (!confirmDelete) return;
    try {
      await UsersApi.deleteTopicProgress(topicId);
      setCourses(courses.filter((course) => course.topic_id !== topicId));
    } catch (error) {
      console.error("Error deleting topic progress:", error);
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (!user) {
    return <Typography>Error loading user data</Typography>;
  }

  return (
    <Stack sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          {/* Left sidebar - Profile info */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              <Card>
                <CardContent>
                  <Stack alignItems="center" spacing={2}>
                    <Avatar
                      sx={{
                        width: 120,
                        height: 120,
                        border: 4,
                        borderColor: "white",
                      }}
                      src={user.photo_url || "/default-avatar.png"}
                      alt={user.name || "Unknown User"}
                    ></Avatar>
                    <Typography variant="h6" fontWeight="bold">
                      {user.name || "Unknown User"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Năm học: {user.year || "Chưa cập nhật"}
                    </Typography>
                    <RowStack spacing={1}>
                      <IconButton color="primary">
                        <Message sx={{ fontSize: 20 }} />
                      </IconButton>
                      <IconButton color="primary">
                        <Phone sx={{ fontSize: 20 }} />
                      </IconButton>
                      <IconButton color="primary">
                        <Share sx={{ fontSize: 20 }} />
                      </IconButton>
                      <IconButton color="primary">
                        <Typography fontWeight="bold">···</Typography>
                      </IconButton>
                    </RowStack>
                  </Stack>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <RowStack spacing={2}>
                      <Box
                        sx={{
                          p: 1,
                          bgcolor: "primary.light",
                          borderRadius: "50%",
                        }}
                      >
                        <Email sx={{ fontSize: 18, color: "primary.main" }} />
                      </Box>
                      <Typography variant="body2">{user.email}</Typography>
                    </RowStack>
                    {user.phone && (
                      <RowStack spacing={2}>
                        <Box
                          sx={{
                            p: 1,
                            bgcolor: "primary.light",
                            borderRadius: "50%",
                          }}
                        >
                          <Phone sx={{ fontSize: 18, color: "primary.main" }} />
                        </Box>
                        <Typography variant="body2">{user.phone}</Typography>
                      </RowStack>
                    )}
                    <RowStack spacing={2}>
                      <Box
                        sx={{
                          p: 1,
                          bgcolor: "primary.light",
                          borderRadius: "50%",
                        }}
                      >
                        <LocationOn
                          sx={{ fontSize: 18, color: "primary.main" }}
                        />
                      </Box>
                      <Typography variant="body2">
                        {user.address || "Chưa cập nhật địa chỉ"}
                      </Typography>
                    </RowStack>
                    <RowStack spacing={2}>
                      <Box
                        sx={{
                          p: 1,
                          bgcolor: "primary.light",
                          borderRadius: "50%",
                        }}
                      >
                        <School sx={{ fontSize: 18, color: "primary.main" }} />
                      </Box>
                      <Typography variant="body2">
                        {user.school || "Chưa cập nhật trường học"}
                      </Typography>
                    </RowStack>
                    {user.bio && (
                      <RowStack spacing={2}>
                        <Box
                          sx={{
                            p: 1,
                            bgcolor: "primary.light",
                            borderRadius: "50%",
                          }}
                        >
                          <Description
                            sx={{ fontSize: 18, color: "primary.main" }}
                          />
                        </Box>
                        <Typography variant="body2">{user.bio}</Typography>
                      </RowStack>
                    )}
                    {user.quote && (
                      <RowStack spacing={2}>
                        <Box
                          sx={{
                            p: 1,
                            bgcolor: "primary.light",
                            borderRadius: "50%",
                          }}
                        >
                          <FormatQuote
                            sx={{ fontSize: 18, color: "primary.main" }}
                          />
                        </Box>
                        <Typography variant="body2">{user.quote}</Typography>
                      </RowStack>
                    )}
                  </Stack>
                </CardContent>
              </Card>

              {(user.social_media?.facebook ||
                user.social_media?.instagram ||
                user.social_media?.other) && (
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="medium" mb={2}>
                      Tài khoản mạng xã hội
                    </Typography>
                    <Stack spacing={2}>
                      {user.social_media?.facebook && (
                        <RowStack justifyContent="space-between">
                          <RowStack spacing={2}>
                            <FacebookIcon
                              sx={{ color: "primary.main", fontSize: 20 }}
                            />
                            <Typography>
                              {user.social_media.facebook}
                            </Typography>
                          </RowStack>
                          <Typography color="text.secondary">›</Typography>
                        </RowStack>
                      )}
                      {user.social_media?.instagram && (
                        <RowStack justifyContent="space-between">
                          <RowStack spacing={2}>
                            <InstagramIcon
                              sx={{ color: "primary.main", fontSize: 20 }}
                            />
                            <Typography>
                              {user.social_media.instagram}
                            </Typography>
                          </RowStack>
                          <Typography color="text.secondary">›</Typography>
                        </RowStack>
                      )}
                      {user.social_media?.other && (
                        <RowStack justifyContent="space-between">
                          <RowStack spacing={2}>
                            <LanguageIcon
                              sx={{ color: "primary.main", fontSize: 20 }}
                            />
                            <Typography>{user.social_media.other}</Typography>
                          </RowStack>
                          <Typography color="text.secondary">›</Typography>
                        </RowStack>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              )}

              <Button
                variant="contained"
                startIcon={<Edit sx={{ fontSize: 16 }} />}
                fullWidth
                onClick={() => setIsEditingProfile(!isEditingProfile)}
              >
                {isEditingProfile ? "Ẩn chỉnh sửa" : "Edit profile"}
              </Button>

              {isEditingProfile && (
                <EditProfileForm
                  onClose={() => setIsEditingProfile(false)}
                  initialProfile={{
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    photo_url: user.photo_url,
                    address: user.address,
                    year: user.year,
                    school: user.school,
                    bio: user.bio,
                    quote: user.quote,
                    social_media: user.social_media,
                  }}
                  onSubmit={handleProfileSubmit}
                />
              )}
            </Stack>
          </Grid>

          {/* Right content - Courses and Skills */}
          <Grid item xs={12} md={8}>
            <Stack spacing={4}>
              {/* Courses section */}
              <Card>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" mb={2}>
                    <Typography variant="h6" fontWeight="bold">
                      Các lộ trình đang theo học
                    </Typography>
                    <IconButton onClick={() => coursesDialog.handleOpen()}>
                      <Edit sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Stack>
                  {coursesDialog.open ? (
                    <EditCoursesForm
                      onClose={coursesDialog.handleClose}
                      initialCourses={courses}
                      onSubmit={handleCoursesSubmit}
                    />
                  ) : (
                    <Stack spacing={3}>
                      {courses.length === 0 ? (
                        <Typography>Chưa có lộ trình nào</Typography>
                      ) : (
                        courses.map((course) => (
                          <RowStack key={course.topic_id} spacing={2}>
                            <Box
                              sx={{
                                width: 48,
                                height: 48,
                                bgcolor: "primary.light",
                                borderRadius: 1,
                              }}
                            />
                            <Stack flexGrow={1}>
                              <Typography fontWeight="bold">
                                {course.title || "Unknown Topic"}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Status: {course.status}
                              </Typography>
                              {course.notes && (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Notes: {course.notes}
                                </Typography>
                              )}
                              {course.rating && (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Rating: {course.rating}/5
                                </Typography>
                              )}
                            </Stack>
                            <IconButton
                              color="error"
                              onClick={() =>
                                handleDeleteTopicProgress(course.topic_id)
                              }
                            >
                              <Delete sx={{ fontSize: 20 }} />
                            </IconButton>
                          </RowStack>
                        ))
                      )}
                    </Stack>
                  )}
                </CardContent>
              </Card>

              {/* Skills section */}
              <Card>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" mb={2}>
                    <Typography variant="h6" fontWeight="bold">
                      Kỹ năng
                    </Typography>
                    <IconButton onClick={() => skillsDialog.handleOpen()}>
                      <Edit sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Stack>
                  <Tabs value={tabValue} onChange={handleTabChange}>
                    <Tab label="All" value={0} />
                    <Tab label="Industry knowledge" value={1} />
                    <Tab label="Tools & Technologies" value={2} />
                  </Tabs>
                  {skillsDialog.open ? (
                    <EditSkillsForm
                      onClose={skillsDialog.handleClose}
                      initialSkills={user.skills || []}
                      onSubmit={handleSkillsSubmit}
                    />
                  ) : (
                    <>
                      {tabValue === 0 && (
                        <Stack spacing={2} mt={2}>
                          {user.skills && user.skills.length > 0 ? (
                            user.skills.map((skill, index) => (
                              <RowStack
                                key={index}
                                justifyContent="space-between"
                              >
                                <RowStack spacing={1}>
                                  <Verified sx={{ color: "primary.main" }} />
                                  <Typography>{skill}</Typography>
                                </RowStack>
                              </RowStack>
                            ))
                          ) : (
                            <Typography>Chưa có kỹ năng nào</Typography>
                          )}
                        </Stack>
                      )}
                      {tabValue === 1 && (
                        <Stack spacing={2} mt={2}>
                          <Typography>
                            Industry knowledge content goes here...
                          </Typography>
                        </Stack>
                      )}
                      {tabValue === 2 && (
                        <Stack spacing={2} mt={2}>
                          <Typography>
                            Tools & Technologies content goes here...
                          </Typography>
                        </Stack>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Stack>
  );
};

export default ProfileContent;
