"use client";

import type React from "react";
import {
  Button,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
  Collapse,
  Alert,
  Grid2,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LinkIcon from "@mui/icons-material/Link";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import CloseIcon from "@mui/icons-material/Close";
import { useRouter } from "next/navigation";
import LoadingState from "@/components/loading-state";
import RowStack from "@/components/row-stack";
import { paths } from "@/paths";
import { useDialog } from "@/hooks/use-dialog";
import RoadmapInfoDetail from "./roadmap-info-detail";
import useRoadmapDetailSearch from "./use-roadmap-detai-search";
import RoadmpaDetailChild from "./roadmap-detail-child";
import DialogAddTopic from "./dialog-add-topic";
import useFunction from "@/hooks/use-function";
import { TopicApi } from "@/api/topic";
import { getResourceIcon } from "@/utils/icon-helper"

// Helper function to get resource icon


const RoadmapDetailContent = () => {
  const router = useRouter();
  const deleteTopicApi = useFunction(TopicApi.deleteTopic, {
    successMessage: "Xóa topic thành công",
    onSuccess: ({ payload }: { payload: string }) => {
      if (payload) {
        router.push(paths.admin.roadmap.index);
      }
    },
  });
  const {
    topic,
    parentTopic,
    childTopics,
    isEditing,
    editedTopic,
    alertInfo,
    handleEditToggle,
    handleTopicChange,
    handleTopicSelectChange,
    handleSaveTopic,
    handleAddResource,
    handleRemoveResource,
    handleResourceChange,
    handleCloseAlert,
  } = useRoadmapDetailSearch();
  const dialogAddTopic = useDialog();
  if (!topic) {
    return <LoadingState />;
  }
  return (
    <Stack>
      <Collapse in={alertInfo.open}>
        <Alert
          severity={alertInfo.severity}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={handleCloseAlert}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          sx={{ mb: 2 }}
        >
          {alertInfo.message}
        </Alert>
      </Collapse>

      <RowStack spacing={2} alignItems="center" sx={{ my: 3 }}>
        <IconButton onClick={() => router.back()}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" flex={1}>
          Chi tiết Topic
        </Typography>
        <Stack
          direction="row"
          justifyContent="flex-end"
          spacing={2}
          sx={{ mb: 3 }}
        >
          {isEditing ? (
            <>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleEditToggle}
              >
                Hủy
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveTopic}
              >
                Lưu
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={handleEditToggle}
              >
                Chỉnh sửa
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={dialogAddTopic.handleOpen}
              >
                Thêm topic con
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => {
                  if (window.confirm("Bạn có chắc chắn muốn xóa topic này?")) {
                    deleteTopicApi.call(topic.id);
                  }
                }}
              >
                Xóa
              </Button>
            </>
          )}
        </Stack>
      </RowStack>

      <RoadmapInfoDetail
        topic={topic}
        isEditing={isEditing}
        editedTopic={editedTopic}
        handleTopicChange={handleTopicChange}
        handleTopicSelectChange={handleTopicSelectChange}
        handleResourceChange={handleResourceChange}
        handleAddResource={handleAddResource}
        handleRemoveResource={handleRemoveResource}
      />

      {!isEditing && (
        <Grid2 container spacing={3}>
          <Grid2
            size={{
              xs: 12,
              md: 8,
            }}
          >
            {topic.resources && topic.resources.length > 0 ? (
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  Tài nguyên ({topic.resources.length})
                </Typography>
                <List>
                  {topic.resources.map((resource: any, index: number) => (
                    <ListItem
                      key={index}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          aria-label="open link"
                          href={resource.url}
                          target="_blank"
                        >
                          <LinkIcon />
                        </IconButton>
                      }
                    >
                      <ListItemIcon>
                        {getResourceIcon(resource.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={resource.title}
                        secondary={resource.type}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            ) : (
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  Chưa có tài nguyên nào
                </Typography>
              </Paper>
            )}
          </Grid2>

          <Grid2
            size={{
              xs: 12,
              md: 4,
            }}
          >
            <RoadmpaDetailChild
              parentTopic={parentTopic}
              childTopics={childTopics}
            />
          </Grid2>
        </Grid2>
      )}

      {/* Dialog for adding new child topic */}
      <DialogAddTopic
        open={dialogAddTopic.open}
        onClose={dialogAddTopic.handleClose}
        topic={topic}
        childs={childTopics}
      />
    </Stack>
  );
};

export default RoadmapDetailContent;
