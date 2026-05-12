"use client";

import type React from "react";

import { useCallback } from "react";
import {
  Box,
  Button,
  Divider,
  FormControl,
  FormHelperText,
  Grid2,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useRouter } from "next/navigation";
import {
  initialValuesTopic,
  Topic,
  TopicType,
  topicValidateSchema,
} from "@/types/topic";
import useAppSnackbar from "@/hooks/use-app-snackbar";
import useFunction from "@/hooks/use-function";
import { TopicApi } from "@/api/topic";
import { paths } from "@/paths";
import { useFormik } from "formik";
import RowStack from "@/components/row-stack";

const CreateTopic = () => {
  const router = useRouter();
  const { showSnackbarSuccess } = useAppSnackbar();
  const createTopicApi = useFunction(TopicApi.createTopic, {
    onSuccess: () => {
      showSnackbarSuccess("Thêm topic thành công");
      router.push(paths.admin.roadmap.index);
    },
  });

  const formik = useFormik({
    initialValues: initialValuesTopic,
    validationSchema: topicValidateSchema,
    onSubmit: (values) => {
      createTopicApi.call({
        ...values,
        resources: values.resources.filter((r) => r.title),
        parent_id: null,
        level: 1,
      } as Topic);
    },
  });

  const handleAddResource = useCallback(() => {
    formik.setFieldValue("resources", [
      ...formik.values.resources,
      { title: "", type: TopicType.other, url: "" },
    ]);
  }, [formik]);

  const handleRemoveResource = useCallback(
    (index: number) => {
      if (formik.values.resources.length === 1) return;
      const updated = [...formik.values.resources];
      updated.splice(index, 1);
      formik.setFieldValue("resources", updated);
    },
    [formik],
  );

  const handleResourceChange = useCallback(
    (index: number, field: "title" | "type" | "url", value: string) => {
      const updated = [...formik.values.resources];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      formik.setFieldValue("resources", updated);
    },
    [formik],
  );

  return (
    <Stack>
      <RowStack spacing={2} sx={{ mb: 3 }}>
        <IconButton onClick={() => router.push(paths.admin.roadmap.index)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" fontWeight="bold">
          Tạo Topic mới
        </Typography>
      </RowStack>

      <Paper sx={{ p: 3 }}>
        <RowStack mb={1}>
          <TextField
            fullWidth
            label="Tiêu đề"
            {...formik.getFieldProps("title")}
            error={formik.touched.title && Boolean(formik.errors.title)}
            helperText={formik.touched.title && formik.errors.title}
          />
        </RowStack>
        <Grid2 container spacing={3}>
          <Grid2 size={12}>
            <TextField
              fullWidth
              label="Mô tả"
              {...formik.getFieldProps("description")}
              multiline
              rows={4}
            />
          </Grid2>

          {/* <Grid2
            size={{
              xs: 12,
              md: 4,
            }}
          >
            <FormControl fullWidth>
              <InputLabel>Độ ưu tiên</InputLabel>
              <Select
                name='priority'
                value={formik.values.priority}
                onChange={formik.handleChange}
                label='Độ ưu tiên'
              >
                {[1, 2, 3, 4, 5].map((p) => (
                  <MenuItem key={p} value={p}>
                    {p}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid2> */}

          <Grid2 size={12}>
            <Divider sx={{ my: 2 }} />
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Typography variant="h6" fontWeight="bold">
                Tài nguyên
              </Typography>
              <Button startIcon={<AddIcon />} onClick={handleAddResource}>
                Thêm tài nguyên
              </Button>
            </Stack>

            {formik.values.resources.map((resource, index) => (
              <Box key={index} sx={{ mb: 3 }}>
                <Grid2 container spacing={2} alignItems="center">
                  <Grid2 size={4}>
                    <TextField
                      fullWidth
                      label="Tiêu đề tài nguyên"
                      value={resource.title}
                      onChange={(e) =>
                        handleResourceChange(index, "title", e.target.value)
                      }
                      size="small"
                    />
                    <FormHelperText>
                      {formik.touched.resources &&
                        formik.errors.resources &&
                        formik.errors.resources[index] &&
                        (formik.errors.resources[index] as any).title}
                    </FormHelperText>
                  </Grid2>

                  <Grid2 size={3}>
                    <FormControl fullWidth>
                      <InputLabel>Loại</InputLabel>
                      <Select
                        value={resource.type}
                        onChange={(e) =>
                          handleResourceChange(index, "type", e.target.value)
                        }
                        label="Loại"
                      >
                        {Object.values(TopicType).map((type) => (
                          <MenuItem key={type} value={type}>
                            {type}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid2>

                  <Grid2 size={4}>
                    <TextField
                      fullWidth
                      label="URL"
                      value={resource.url}
                      onChange={(e) =>
                        handleResourceChange(index, "url", e.target.value)
                      }
                      size="small"
                    />
                  </Grid2>

                  <Grid2 size={1}>
                    <IconButton
                      color="error"
                      onClick={() => handleRemoveResource(index)}
                      disabled={formik.values.resources.length === 1}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid2>
                </Grid2>
              </Box>
            ))}
          </Grid2>

          <Grid2 size={12}>
            <Divider sx={{ my: 2 }} />
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => router.push(paths.admin.roadmap.index)}
              >
                Hủy
              </Button>
              <Button
                onClick={() => formik.handleSubmit()}
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={createTopicApi.loading}
              >
                Lưu
              </Button>
            </Stack>
          </Grid2>
        </Grid2>
      </Paper>
    </Stack>
  );
};

export default CreateTopic;
