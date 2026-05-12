import { CustomTableConfig } from "@/components/custom-table";
import { Typography } from "@mui/material";

export const getSkillTableConfig = (): CustomTableConfig<any, any>[] => [
  {
    key: "skill",
    headerLabel: "Kỹ năng",
    headerCellProps: {
      sx: {
        whiteSpace: "normal",
        maxWidth: 200,
      },
    },
    renderCell: (data) => <Typography variant='body2'>{data.skill}</Typography>,
  },
  {
    key: "demandPercentage",
    headerLabel: "Tần suất trong tuyển dụng",
    headerCellProps: {
      sx: {
        whiteSpace: "normal",
        maxWidth: 200,
      },
    },
    renderCell: (data) => (
      <Typography variant='body2'>{data.demandPercentage}</Typography>
    ),
  },
  {
    key: "candidatePercentage",
    headerLabel: "Tần suất trong ứng viên",
    headerCellProps: {
      sx: {
        whiteSpace: "normal",
        maxWidth: 120,
      },
    },
    renderCell: (data) => (
      <Typography variant='body2'>{data.candidatePercentage}</Typography>
    ),
  },
];
