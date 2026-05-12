"use client";

import {
  Container,
  Typography,
  Box,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useRoadmapSearch } from "./use-roadmap-search";
import RoadmapGrid from "../_components/roadmap-grid";

export default function RoadmapContent() {
  const { topicLevel1 } = useRoadmapSearch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <>
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        <Container
          maxWidth="lg"
          sx={{
            py: { xs: 4, sm: 6, md: 8 },
            px: { xs: 2, sm: 3, md: 4 },
          }}
        >
          <Box sx={{ textAlign: "center", mb: { xs: 4, sm: 6, md: 8 } }}>
            <Typography
              variant={isMobile ? "h3" : "h2"}
              component="h1"
              fontWeight="bold"
            >
              Lộ trình phát triển
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                maxWidth: "800px",
                mx: "auto",
                fontSize: { xs: "0.875rem", sm: "1rem" },
              }}
            >
              Lộ trình phát triển là một dự án cộng đồng nhằm xây dựng các lộ
              trình, hướng dẫn và nội dung học tập khác để hỗ trợ lập trình viên
              lựa chọn con đường phù hợp và định hướng quá trình học tập của
              mình.
            </Typography>
          </Box>

          <Box sx={{ mb: { xs: 4, sm: 6, md: 8 } }}>
            <RoadmapGrid roadmaps={topicLevel1} />
          </Box>
        </Container>
      </Box>
    </>
  );
}
