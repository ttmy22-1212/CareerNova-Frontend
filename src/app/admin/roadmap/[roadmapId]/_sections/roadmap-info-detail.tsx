import {
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  type SelectChangeEvent,
  Grid2,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { Topic, TopicType } from "@/types/topic";
import RowStack from "@/components/row-stack";

interface RoadmapInfoDetailProps {
  isEditing: boolean;
  topic: Topic;
  editedTopic: Topic;
  handleTopicChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleTopicSelectChange: (e: SelectChangeEvent<number>) => void;
  handleResourceChange: (index: number, field: string, value: string) => void;
  handleAddResource: () => void;
  handleRemoveResource: (index: number) => void;
}

const RoadmapInfoDetail = ({
  isEditing,
  topic,
  editedTopic,
  handleTopicChange,
  handleTopicSelectChange,
  handleResourceChange,
  handleAddResource,
  handleRemoveResource,
}: RoadmapInfoDetailProps) => {
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      {isEditing && editedTopic ? (
        // Edit mode
        <Grid2 container spacing={3}>
          <Grid2
            size={{
              xs: 12,
              md: 10,
            }}
          >
            <TextField
              fullWidth
              label="Tiêu đề"
              name="title"
              value={editedTopic.title}
              onChange={handleTopicChange}
              required
            />
          </Grid2>

          {editedTopic.priority && (
            <Grid2
              size={{
                xs: 12,
                md: 2,
              }}
            >
              {
                <FormControl fullWidth>
                  <InputLabel>Độ ưu tiên</InputLabel>
                  <Select
                    name="priority"
                    value={editedTopic.priority}
                    onChange={handleTopicSelectChange}
                    label="Độ ưu tiên"
                  >
                    {[1, 2, 3].map((p) => (
                      <MenuItem key={p} value={p}>
                        {p}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              }
            </Grid2>
          )}

          <Grid2 size={12}>
            <TextField
              fullWidth
              label="Mô tả"
              name="description"
              value={editedTopic.description || ""}
              onChange={handleTopicChange}
              multiline
              rows={4}
            />
          </Grid2>

          <Grid2 size={12}>
            <Divider sx={{ my: 2 }} />
            <RowStack justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Tài nguyên
              </Typography>
              <Button startIcon={<AddIcon />} onClick={handleAddResource}>
                Thêm tài nguyên
              </Button>
            </RowStack>

            {editedTopic.resources &&
              editedTopic.resources.map((resource: any, index: number) => (
                <Box key={index} sx={{ mb: 3 }}>
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
                        value={resource.title || ""}
                        onChange={(e) =>
                          handleResourceChange(index, "title", e.target.value)
                        }
                      />
                    </Grid2>

                    <Grid2
                      size={{
                        xs: 12,
                        md: 3,
                      }}
                    >
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

                    <Grid2
                      size={{
                        xs: 12,
                        md: 4,
                      }}
                    >
                      <TextField
                        fullWidth
                        label="URL"
                        value={resource.url || ""}
                        onChange={(e) =>
                          handleResourceChange(index, "url", e.target.value)
                        }
                      />
                    </Grid2>

                    <Grid2
                      size={{
                        xs: 12,
                        md: 1,
                      }}
                    >
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveResource(index)}
                        disabled={editedTopic.resources?.length === 1}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid2>
                  </Grid2>
                </Box>
              ))}
          </Grid2>
        </Grid2>
      ) : (
        // View mode
        <>
          <RowStack justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography variant="h5" fontWeight="bold">
              {topic.title}
            </Typography>
            <Chip
              label={`Level ${topic.level}`}
              color={topic.level === 1 ? "primary" : "secondary"}
            />
          </RowStack>

          <Typography variant="body1" sx={{ mb: 3 }}>
            {topic.description}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Grid2 container spacing={2}>
            {topic.priority ? (
              <Grid2
                size={{
                  xs: 6,
                  md: 3,
                }}
              >
                <Typography variant="subtitle2" color="text.secondary">
                  Độ ưu tiên
                </Typography>
                <Typography variant="body2">{topic.priority}</Typography>
              </Grid2>
            ) : (
              topic.order && (
                <Grid2
                  size={{
                    xs: 6,
                    md: 3,
                  }}
                >
                  <Typography variant="subtitle2" color="text.secondary">
                    Thứ tự
                  </Typography>
                  <Typography variant="body2">{topic.order}</Typography>
                </Grid2>
              )
            )}
            <Grid2
              size={{
                xs: 6,
                md: 3,
              }}
            >
              <Typography variant="subtitle2" color="text.secondary">
                Ngày tạo
              </Typography>
              <Typography variant="body2">
                {new Date(topic.created_at).toLocaleDateString("vi-VN")}
              </Typography>
            </Grid2>
            <Grid2
              size={{
                xs: 6,
                md: 3,
              }}
            >
              <Typography variant="subtitle2" color="text.secondary">
                Cập nhật lần cuối
              </Typography>
              <Typography variant="body2">
                {new Date(topic.updated_at).toLocaleDateString("vi-VN")}
              </Typography>
            </Grid2>
          </Grid2>
        </>
      )}
    </Paper>
  );
};

export default RoadmapInfoDetail;
