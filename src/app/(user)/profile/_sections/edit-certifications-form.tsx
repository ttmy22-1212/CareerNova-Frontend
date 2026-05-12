"use client";

import { useState } from "react";
import { Box, Button, TextField, Stack } from "@mui/material";
import useFunction from "@/hooks/use-function";

const submitCertificationsApi = async (payload: { cert: string; color: string }[]) => {
    return new Promise((resolve) => setTimeout(() => resolve(payload), 500));
};

interface Certification {
    cert: string;
    color: string;
}

interface EditCertificationsFormProps {
    onClose: () => void;
    initialCertifications: Certification[];
    onSubmit: (certifications: Certification[]) => void;
}

const EditCertificationsForm = ({
    onClose,
    initialCertifications,
    onSubmit,
}: EditCertificationsFormProps) => {
    const [certifications, setCertifications] = useState(initialCertifications);

    const { call, loading } = useFunction(submitCertificationsApi, {
        successMessage: "Cập nhật chứng chỉ thành công!",
        onSuccess: ({ payload }: { payload: Certification[]; result: unknown }) => {
            onSubmit(payload);
            onClose();
        },
    });

    const handleCertChange = (index: number, field: keyof Certification, value: string) => {
        const updatedCerts = [...certifications];
        updatedCerts[index][field] = value;
        setCertifications(updatedCerts);
    };

    const handleSubmit = () => {
        call(certifications);
    };

    return (
        <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 1 }}>
            <Stack spacing={2}>
                {certifications.map((cert, index) => (
                    <Stack key={index} spacing={1}>
                        <TextField
                            label={`Chứng chỉ ${index + 1}`}
                            value={cert.cert}
                            onChange={(e) => handleCertChange(index, "cert", e.target.value)}
                            fullWidth
                        />
                        <TextField
                            label={`Màu sắc ${index + 1}`}
                            value={cert.color}
                            onChange={(e) => handleCertChange(index, "color", e.target.value)}
                            fullWidth
                        />
                    </Stack>
                ))}
                <Button variant="contained" onClick={handleSubmit} disabled={loading}>
                    {loading ? "Đang lưu..." : "Xác nhận"}
                </Button>
            </Stack>
        </Box>
    );
};

export default EditCertificationsForm;