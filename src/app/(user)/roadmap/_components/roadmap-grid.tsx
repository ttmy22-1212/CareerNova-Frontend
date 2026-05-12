"use client"

import { Grid, useMediaQuery, useTheme } from "@mui/material"
import RoadmapCard from "./roadmap-card"
import { Topic } from "@/types/topic"

interface RoadmapGridProps {
  roadmaps: Topic[]
}

export default function RoadmapGrid({ roadmaps }: RoadmapGridProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  return (
    <Grid container spacing={isMobile ? 1.5 : 2}>
      {roadmaps.map((roadmap) => (
        <Grid item xs={12} sm={6} md={4} key={roadmap.id}>
          <RoadmapCard id={roadmap.id} title={roadmap.title} description={roadmap.description || ""} />
        </Grid>
      ))}
    </Grid>
  )
}
