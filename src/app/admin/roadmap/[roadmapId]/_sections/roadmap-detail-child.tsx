import type React from "react";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { Topic } from "@/types/topic";
import RowStack from "@/components/row-stack";
import { paths } from "@/paths";
import { useTopicContext } from "@/contexts/topic/topic-context";
import useFunction from "@/hooks/use-function";
import { TopicApi } from "@/api/topic";

interface RoadmapResourceDetailProps {
  parentTopic: Topic | null;
  childTopics: Topic[];
}

const RoadmpaDetailChild = ({
  parentTopic,
  childTopics,
}: RoadmapResourceDetailProps) => {
  const router = useRouter();
  const { getTopicByIdApi } = useTopicContext();
  const deleteChildTopicApi = useFunction(TopicApi.deleteTopic, {
    successMessage: "Xóa topic thành công",
    onSuccess: ({ payload }: { payload: string }) => {
      if (getTopicByIdApi.data)
        getTopicByIdApi.setData({
          ...getTopicByIdApi.data,
          childs:
            getTopicByIdApi.data.childs.filter(
              (child) => child.id !== payload,
            ) || [],
        });
    },
  });

  return (
    <>
      {parentTopic && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            Topic cha
          </Typography>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold">
                {parentTopic.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Level {parentTopic.level} • Độ ưu tiên: {parentTopic.priority}
              </Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={() =>
                  router.push(
                    paths.admin.roadmap.detail.replace(
                      "[roadmapId]",
                      parentTopic.id,
                    ),
                  )
                }
              >
                Xem chi tiết
              </Button>
            </CardContent>
          </Card>
        </Paper>
      )}

      <Paper sx={{ p: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Typography variant="h6" fontWeight="bold">
            Topics con ({childTopics.length})
          </Typography>
        </Stack>

        <Box sx={{ mt: 2 }} maxHeight={300} overflow="auto">
          {childTopics.map((childTopic) => (
            <Card key={childTopic.id} variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <RowStack justifyContent="space-between">
                  <Typography variant="subtitle1" fontWeight="bold">
                    {childTopic.title}
                  </Typography>
                  {childTopic.priority ? (
                    <Chip
                      label={`Ưu tiên: ${childTopic.priority}`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ) : (
                    childTopic.order && (
                      <Chip
                        label={`Bài: ${childTopic.order}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    )
                  )}
                </RowStack>

                {childTopic.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    {childTopic.description.length > 100
                      ? `${childTopic.description.substring(0, 100)}...`
                      : childTopic.description}
                  </Typography>
                )}

                <RowStack
                  justifyContent={"flex-end"}
                  spacing={1}
                  sx={{ mt: 2 }}
                >
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() =>
                      router.push(
                        paths.admin.roadmap.detail.replace(
                          "[roadmapId]",
                          childTopic?.id || "",
                        ),
                      )
                    }
                  >
                    Chi tiết
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    onClick={() => {
                      if (window.confirm("Bạn có chắc chắn xoá không?"))
                        deleteChildTopicApi.call(childTopic?.id || "");
                    }}
                  >
                    Xóa
                  </Button>
                </RowStack>
              </CardContent>
            </Card>
          ))}

          {childTopics.length === 0 && (
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ py: 2 }}
            >
              Chưa có topic con nào. Hãy thêm topic con mới.
            </Typography>
          )}
        </Box>
      </Paper>
    </>
  );
};

export default RoadmpaDetailChild;
