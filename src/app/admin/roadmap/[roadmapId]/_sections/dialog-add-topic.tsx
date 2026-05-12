import {
  Box,
  Button,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid2,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import {
  initialValuesTopic,
  Topic,
  TopicType,
  topicValidateSchema,
} from "@/types/topic";
import RowStack from "@/components/row-stack";
import { useFormik } from "formik";
import useFunction from "@/hooks/use-function";
import { TopicApi } from "@/api/topic";
import useAppSnackbar from "@/hooks/use-app-snackbar";
import { useCallback } from "react";
import { useTopicContext } from "@/contexts/topic/topic-context";

interface DialogAddTopicProps {
  open: boolean;
  onClose: () => void;
  topic: Topic;
  childs: Topic[];
}

const DialogAddTopic = ({
  open,
  onClose,
  topic,
  childs,
}: DialogAddTopicProps) => {
  const { showSnackbarSuccess } = useAppSnackbar();
  const { getTopicByIdApi } = useTopicContext();
  const createTopicApi = useFunction(TopicApi.createTopic, {
    onSuccess: ({ result }: { result: Topic }) => {
      showSnackbarSuccess("Thêm topic thành công");

      if (getTopicByIdApi.data)
        getTopicByIdApi.setData({
          ...getTopicByIdApi.data,
          childs: [...(getTopicByIdApi.data.childs || []), result],
        });
      formik.resetForm();
      onClose();
    },
  });

  const formik = useFormik({
    initialValues: initialValuesTopic,
    validationSchema: topicValidateSchema,
    onSubmit: async (values) => {
      await createTopicApi.call({
        ...values,
        resources: values.resources.filter((r) => r.title),
        order:
          childs.some((c) => c.order !== null) || values.priority === null
            ? childs.length + 1
            : null,
        priority: values.priority || null,
        parent_id: topic.id,
        level: topic.level + 1,
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
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Thêm Topic Con Mới</DialogTitle>
      <DialogContent sx={{ pt: "8px !important" }}>
        <Grid2 container spacing={3} sx={{ mt: 0 }}>
          <Grid2
            size={{
              xs: 12,
              md: 8,
            }}
          >
            <TextField
              fullWidth
              label="Tiêu đề"
              {...formik.getFieldProps("title")}
              error={formik.touched.title && Boolean(formik.errors.title)}
              helperText={formik.touched.title && formik.errors.title}
            />
          </Grid2>

          <Grid2
            size={{
              xs: 12,
              md: 4,
            }}
          >
            <FormControl fullWidth>
              <InputLabel>Độ ưu tiên</InputLabel>
              <Select
                name="priority"
                value={formik.values.priority}
                onChange={formik.handleChange}
                label="Độ ưu tiên"
              >
                {[0, 1, 2, 3].map((p) => (
                  <MenuItem key={p} value={p}>
                    {p}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid2>

          <Grid2 size={12}>
            <TextField
              fullWidth
              label="Mô tả"
              {...formik.getFieldProps("description")}
              multiline
              rows={3}
            />
          </Grid2>

          <Grid2 size={12}>
            <Divider sx={{ my: 1 }} />
            <RowStack justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Tài nguyên
              </Typography>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={handleAddResource}
              >
                Thêm tài nguyên
              </Button>
            </RowStack>

            {formik.values.resources.map((resource, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Grid2 container spacing={2} alignItems="center">
                  <Grid2
                    size={{
                      xs: 12,
                      md: 4,
                    }}
                  >
                    <TextField
                      fullWidth
                      label="Tiêu đề tài nguyên"
                      value={resource.title}
                      onChange={(e) =>
                        handleResourceChange(index, "title", e.target.value)
                      }
                      size="small"
                    />
                  </Grid2>

                  <Grid2
                    size={{
                      xs: 12,
                      md: 3,
                    }}
                  >
                    <FormControl fullWidth size="small">
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

                  <Grid2
                    size={{
                      xs: 12,
                      md: 4,
                    }}
                  >
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

                  <Grid2
                    size={{
                      xs: 12,
                      md: 1,
                    }}
                  >
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemoveResource(index)}
                      disabled={formik.values.resources.length === 1}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Grid2>
                </Grid2>
              </Box>
            ))}
          </Grid2>
        </Grid2>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button
          onClick={() => formik.handleSubmit()}
          variant="contained"
          disabled={createTopicApi.loading}
        >
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogAddTopic;
