// components/EditIntroductionForm.tsx
"use client";

import { useState } from "react";
import { Box, Button, TextField, Stack } from "@mui/material";
import  useFunction  from "@/hooks/use-function";

// Hàm giả lập API để gửi dữ liệu
const submitIntroductionApi = async (payload: string): Promise<string> => {
    return new Promise<string>((resolve) => {
        setTimeout(() => resolve(payload), 500); // Giả lập API delay
    });
};

interface EditIntroductionFormProps {
    onClose: () => void;
    initialValue: string;
    onSubmit: (result: string) => void;
}

const EditIntroductionForm = ({ onClose, initialValue, onSubmit }: EditIntroductionFormProps) => {
    const [introduction, setIntroduction] = useState(initialValue);

    const { call, loading } = useFunction(submitIntroductionApi, {
        successMessage: "Cập nhật giới thiệu thành công!",
        onSuccess: ({ result }: { result: string }) => {
            onSubmit(result); // Cập nhật dữ liệu trong component cha
            onClose(); // Đóng form
        },
     
    });

    const handleSubmit = () => {
        call(introduction);
    };

    return (
        <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 1 }}>
            <Stack spacing={2}>
                <TextField
                    label="Giới thiệu"
                    multiline
                    rows={4}
                    value={introduction}
                    onChange={(e) => setIntroduction(e.target.value)}
                    fullWidth
                />
                <Button variant="contained" onClick={handleSubmit} disabled={loading}>
                    {loading ? "Đang lưu..." : "Xác nhận"}
                </Button>
            </Stack>
        </Box>
    );
};

export default EditIntroductionForm;