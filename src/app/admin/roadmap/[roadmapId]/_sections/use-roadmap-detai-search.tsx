import { TopicApi } from "@/api/topic";
import { useTopicContext } from "@/contexts/topic/topic-context";
import useFunction from "@/hooks/use-function";
import { Topic, TopicType } from "@/types/topic";
import { SelectChangeEvent } from "@mui/material";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

const useRoadmapDetailSearch = () => {
  const params = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTopic, setEditedTopic] = useState<any>(null);
  const { getTopicByIdApi } = useTopicContext();
  const updateTopicApi = useFunction(TopicApi.updateTopic, {
    successMessage: "Cập nhật topic thành công",
    onSuccess: ({ result }: { result: Topic }) => {
      if (getTopicByIdApi.data)
        getTopicByIdApi.setData({
          ...getTopicByIdApi.data,
          topic: result,
        });
      setIsEditing(false);
    },
  });

  const [alertInfo, setAlertInfo] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const topic = useMemo(
    () => getTopicByIdApi.data?.topic || null,
    [getTopicByIdApi.data],
  );
  const childTopics = useMemo(
    () =>
      getTopicByIdApi.data?.childs.sort(
        (a, b) => (a.order || 0) - (b.order || 0),
      ) || [],
    [getTopicByIdApi.data],
  );
  const parentTopic = useMemo(
    () => getTopicByIdApi.data?.parent || null,
    [getTopicByIdApi.data],
  );

  useEffect(() => {
    getTopicByIdApi.call(params.roadmapId as string);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.roadmapId]);

  useEffect(() => {
    if (topic) {
      setEditedTopic({ ...topic });
    }
  }, [topic]);

  const handleEditToggle = useCallback(() => {
    if (isEditing) {
      // Cancel editing
      setEditedTopic({ ...topic });
    }
    setIsEditing(!isEditing);
  }, [isEditing, topic]);

  const handleTopicChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setEditedTopic({
        ...editedTopic,
        [name]: value,
      });
    },
    [editedTopic],
  );

  const handleTopicSelectChange = useCallback(
    (e: SelectChangeEvent<number>) => {
      const { name, value } = e.target;
      setEditedTopic({
        ...editedTopic,
        [name]: value,
      });
    },
    [editedTopic],
  );

  const handleSaveTopic = useCallback(() => {
    // Validate
    if (!editedTopic.title.trim()) {
      setAlertInfo({
        open: true,
        message: "Tiêu đề không được để trống",
        severity: "error",
      });
      return;
    }

    updateTopicApi.call(editedTopic);
  }, [editedTopic, updateTopicApi]);

  const handleAddResource = useCallback(() => {
    // For main topic
    setEditedTopic({
      ...editedTopic,
      resources: [
        ...editedTopic.resources,
        { title: "", type: TopicType.other, url: "" },
      ],
    });
  }, [editedTopic]);

  const handleRemoveResource = useCallback(
    (index: number) => {
      // For main topic
      const updatedResources = [...editedTopic.resources];
      updatedResources.splice(index, 1);
      setEditedTopic({
        ...editedTopic,
        resources: updatedResources,
      });
    },
    [editedTopic],
  );

  const handleResourceChange = useCallback(
    (index: number, field: string, value: string) => {
      // For main topic
      const updatedResources = [...editedTopic.resources];
      updatedResources[index] = {
        ...updatedResources[index],
        [field]: value,
      };
      setEditedTopic({
        ...editedTopic,
        resources: updatedResources,
      });
    },
    [editedTopic],
  );

  const handleCloseAlert = useCallback(() => {
    setAlertInfo({
      ...alertInfo,
      open: false,
    });
  }, [alertInfo]);

  return {
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
  };
};

export default useRoadmapDetailSearch;
