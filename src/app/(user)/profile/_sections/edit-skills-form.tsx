"use client";

import { useState } from "react";
import { Box, Button, TextField, Stack, Typography } from "@mui/material";
import useFunction from "@/hooks/use-function";
import UsersApi from "@/api/users";
import useAppSnackbar from "@/hooks/use-app-snackbar";

interface EditSkillsFormProps {
    onClose: () => void;
    initialSkills: string[];
    onSubmit: (skills: string[]) => void;
}

const EditSkillsForm = ({ onClose, initialSkills = [], onSubmit }: EditSkillsFormProps) => {
    const { showSnackbarError } = useAppSnackbar();
    const [skills, setSkills] = useState<string[]>(initialSkills);

    const { call, loading } = useFunction(
        async (payload: string[]) => {
            const updatedUser = await UsersApi.addOrUpdateSkills({ skills: payload });
            return updatedUser.skills || [];
        },
        {
            successMessage: "Cập nhật kỹ năng thành công!",
            onSuccess: ({ result }: { result: string[] }) => {
                onSubmit(result);
                onClose();
            },
            onError: (error) => {
                showSnackbarError(`Cập nhật kỹ năng thất bại: ${error}`);
            },
        }
    );

    const handleSkillChange = (index: number, value: string) => {
        const updatedSkills = [...skills];
        updatedSkills[index] = value;
        setSkills(updatedSkills);
    };

    const handleAddSkill = () => {
        setSkills([...skills, ""]);
    };

    const handleRemoveSkill = (index: number) => {
        const updatedSkills = skills.filter((_, i) => i !== index);
        setSkills(updatedSkills);
    };

    const handleSubmit = () => {
        const validSkills = skills.filter((skill) => skill.trim() !== "");
        if (validSkills.length === 0) {
            showSnackbarError("Vui lòng thêm ít nhất một kỹ năng");
            return;
        }
        call(validSkills);
    };

    return (
        <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
                Chỉnh sửa kỹ năng
            </Typography>
            <Stack spacing={2}>
                {skills.length > 0 ? (
                    skills.map((skill, index) => (
                        <Stack key={index} spacing={1} direction="row" alignItems="center">
                            <TextField
                                label={`Kỹ năng ${index + 1}`}
                                value={skill}
                                onChange={(e) => handleSkillChange(index, e.target.value)}
                                fullWidth
                            />
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={() => handleRemoveSkill(index)}
                            >
                                Xóa
                            </Button>
                        </Stack>
                    ))
                ) : (
                    <Typography>Không có kỹ năng nào để chỉnh sửa</Typography>
                )}
                <Button variant="outlined" onClick={handleAddSkill}>
                    Thêm kỹ năng
                </Button>
                <Stack direction="row" spacing={2}>
                    <Button variant="contained" onClick={handleSubmit} disabled={loading}>
                        {loading ? "Đang lưu..." : "Xác nhận"}
                    </Button>
                    <Button variant="outlined" onClick={onClose}>
                        Hủy
                    </Button>
                </Stack>
            </Stack>
        </Box>
    );
};

export default EditSkillsForm;