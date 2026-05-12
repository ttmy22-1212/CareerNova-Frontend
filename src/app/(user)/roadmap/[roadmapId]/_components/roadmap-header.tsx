"use client"

import { Box, Typography, useMediaQuery, useTheme } from "@mui/material"

interface RoadmapHeaderProps {
  title: string
  description: string
}

export default function RoadmapHeader({ title, description }: RoadmapHeaderProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  return (
    <Box sx={{ mb: { xs: 3, sm: 4 } }}>
      <Typography
        variant={isMobile ? "h4" : "h3"}
        component="h1"
        fontWeight="bold"
        sx={{
          mb: 1,
          fontSize: { xs: "1.5rem", sm: "2rem", md: "2.25rem" },
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{
          fontSize: { xs: "0.875rem", sm: "1rem" },
        }}
      >
        {description}
      </Typography>
    </Box>
  )
}
