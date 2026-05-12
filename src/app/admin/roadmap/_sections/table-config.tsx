import { CustomTableConfig } from "@/components/custom-table";
import { Topic } from "@/types/topic";
import { formatDate } from "@/utils/date-helper";
import { Typography } from "@mui/material";

export const getTableConfig = (): CustomTableConfig<Topic["id"], Topic>[] => [
  {
    key: "title",
    headerLabel: "Tiêu đề",
    renderCell: (data) => <Typography variant='body2'>{data.title}</Typography>,
  },
  {
    key: "level",
    headerLabel: "Level",
    renderCell: (data) => <Typography variant='body2'>{data.level}</Typography>,
  },
  {
    key: "description",
    headerLabel: "Mô tả",
    renderCell: (data) => (
      <Typography variant='body2'>{data.description}</Typography>
    ),
  },
  {
    key: "priority",
    headerLabel: "Độ ưu tiên",
    renderCell: (data) => (
      <Typography variant='body2'>{data.priority}</Typography>
    ),
  },
  {
    key: "updated_at",
    headerLabel: "Ngày cập nhật",
    renderCell: (data) => (
      <Typography variant='body2'>
        {formatDate(new Date(data.updated_at))}
      </Typography>
    ),
  },
];
