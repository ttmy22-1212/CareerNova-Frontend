import { Career } from "@/types/career";
import { Chip, Divider, Stack, Typography } from "@mui/material";

const CareerDetailInfo = ({ career }: { career: Career }) => {
  return (
    <Stack gap={3}>
      <Typography variant="h5" fontWeight="bold">
        {career.name}
      </Typography>

      <Typography color="text.secondary">{career.description}</Typography>

      <Typography fontWeight="bold">Kỹ năng cần có:</Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap">
        {career.skills.map((skill, index) => (
          <Chip
            key={index}
            label={skill.name}
            sx={{ bgcolor: "#EEF2FF", color: "#4F46E5", fontWeight: 500 }}
          />
        ))}
      </Stack>
    </Stack>
  );
};

export default CareerDetailInfo;
