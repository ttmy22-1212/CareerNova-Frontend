"use client";

import { useState } from "react";
import { Box, Button, Stack, Typography, IconButton } from "@mui/material";
import { Delete } from "@mui/icons-material";
import useFunction from "@/hooks/use-function";
import UsersApi from "@/api/users";
import useAppSnackbar from "@/hooks/use-app-snackbar";
import { UserTopicProgress } from "@/types/user";

interface EditCoursesFormProps {
    onClose: () => void;
    initialCourses: UserTopicProgress[];
    onSubmit: (courses: UserTopicProgress[]) => void;
}

const isValidObjectId = (id: string): boolean => {
    return /^[0-9a-fA-F]{24}$/.test(id);
};

const EditCoursesForm = ({ onClose, initialCourses, onSubmit }: EditCoursesFormProps) => {
    const { showSnackbarSuccess, showSnackbarError } = useAppSnackbar();
    const [courses, setCourses] = useState<UserTopicProgress[]>(initialCourses);

    const deleteTopicApi = useFunction(
        async (topicId: string) => {
            if (!isValidObjectId(topicId)) {
                throw new Error(`Invalid topicId: ${topicId}`);
            }
            await UsersApi.deleteTopicProgress(topicId);
            return topicId;
        },
        {
            successMessage: "Xóa lộ trình thành công!",
            onError: (error) => {
                showSnackbarError(`Xóa lộ trình thất bại: ${error}`);
            },
        }
    );

    const handleDeleteCourse = async (topicId: string) => {
        const confirmDelete = window.confirm("Bạn có chắc muốn xóa lộ trình này?");
        if (!confirmDelete) return;
        await deleteTopicApi.call(topicId);
        setCourses(courses.filter((course) => course.topic_id !== topicId));
    };

    const handleSubmit = () => {
        onSubmit(courses);
        showSnackbarSuccess("Cập nhật danh sách lộ trình thành công!");
        onClose();
    };

    return (
        <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
                Quản lý lộ trình
            </Typography>
            <Stack spacing={2}>
                {courses.length > 0 ? (
                    courses.map((course) => (
                        <Stack
                            key={course.topic_id}
                            direction="row"
                            spacing={2}
                            alignItems="center"
                            sx={{ p: 1, border: "1px solid #e0e0e0", borderRadius: 1 }}
                        >
                            <Stack flexGrow={1}>
                                <Typography fontWeight="bold">{course.title || "Unknown Topic"}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Status: {course.status}
                                </Typography>
                                {course.notes && (
                                    <Typography variant="body2" color="text.secondary">
                                        Notes: {course.notes}
                                    </Typography>
                                )}
                                {course.rating && (
                                    <Typography variant="body2" color="text.secondary">
                                        Rating: {course.rating}/5
                                    </Typography>
                                )}
                            </Stack>
                            <IconButton
                                color="error"
                                onClick={() => handleDeleteCourse(course.topic_id)}
                                disabled={deleteTopicApi.loading}
                            >
                                <Delete />
                            </IconButton>
                        </Stack>
                    ))
                ) : (
                    <Typography>Không có lộ trình nào để quản lý</Typography>
                )}
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={deleteTopicApi.loading}
                    >
                        Xác nhận
                    </Button>
                    <Button variant="outlined" onClick={onClose}>
                        Hủy
                    </Button>
                </Stack>
            </Stack>
        </Box>
    );
};

export default EditCoursesForm;