"use client"

import { Box, Paper, Typography } from "@mui/material"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import { priority } from "@/theme/colors"

export default function PriorityLegend() {
  return (
    <Paper
      sx={{
        p: 2,
        mb: 4,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
        Chú thích mức độ ưu tiên
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: priority.high.main,
              bgcolor: priority.high.light,
              borderRadius: "50%",
              width: 28,
              height: 28,
            }}
          >
            <CheckCircleIcon fontSize="small" />
          </Box>
          <Typography variant="body2"> Gợi ý cá nhân / Ý kiến cá nhân</Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: priority.medium.main,
              bgcolor: priority.medium.light,
              borderRadius: "50%",
              width: 28,
              height: 28,
            }}
          >
            <CheckCircleIcon fontSize="small" />
          </Box>
          <Typography variant="body2"> Lựa chọn thay thế / Chọn cái này hoặc màu xanh</Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: priority.low.main,
              bgcolor: priority.low.light,
              borderRadius: "50%",
              width: 28,
              height: 28,
            }}
          >
            <CheckCircleIcon fontSize="small" />
          </Box>
          <Typography variant="body2">Thứ tự không bắt buộc / Học lúc nào cũng được</Typography>
        </Box>
      </Box>
    </Paper>
  )
}
