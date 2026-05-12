"use client";

import type React from "react";

import { useCallback } from "react";
import {
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  Typography,
  TextField,
  InputAdornment,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SearchIcon from "@mui/icons-material/Search";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MOCK_TOPICS, Topic } from "@/types/topic";
import useRoadmapSearch from "./use-roadmap-search";
import { CustomTable } from "@/components/custom-table";
import { getTableConfig } from "./table-config";
import RowStack from "@/components/row-stack";
import CustomPagination from "@/components/custom-pagination";
import { paths } from "@/paths";

// Helper function to count resources
const countResources = (resources: any[] | null) => {
  return resources ? resources.length : 0;
};

const RoadmapContent = () => {
  const {
    topics,
    pagination,
    getTopicsApi,
    filter,
    setFilter,
    deleteTopicApi,
  } = useRoadmapSearch();
  const router = useRouter();

  const renderRowActions = useCallback(
    (data: Topic) => (
      <RowStack gap={1}>
        <IconButton
          size='small'
          color='primary'
          onClick={() =>
            router.push(
              paths.admin.roadmap.detail.replace("[roadmapId]", data.id)
            )
          }
        >
          <VisibilityIcon fontSize='small' />
        </IconButton>
        <IconButton
          size='small'
          color='error'
          onClick={() => {
            if (window.confirm("Bạn có chắc chắn muốn xóa topic này?")) {
              deleteTopicApi.call(data.id);
            }
          }}
        >
          <DeleteIcon fontSize='small' />
        </IconButton>
      </RowStack>
    ),
    [router, deleteTopicApi]
  );

  return (
    <Stack>
      <Stack
        direction='row'
        justifyContent='space-between'
        alignItems='center'
        sx={{ mb: 3 }}
      >
        <Typography variant='h4' fontWeight='bold'>
          Quản lý Roadmap
        </Typography>
        <Link href={paths.admin.roadmap.create} passHref>
          <Button variant='contained' startIcon={<AddIcon />}>
            Thêm Topic mới
          </Button>
        </Link>
      </Stack>

      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            placeholder='Tìm kiếm topic...'
            value={filter.title}
            onChange={(value) => {
              setFilter((prev) => ({
                ...prev,
                title: value.target.value,
              }));
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            size='small'
          />
        </Box>
        <CustomTable
          configs={getTableConfig()}
          rows={topics}
          renderRowActions={renderRowActions}
          loading={getTopicsApi.loading}
          onClickRow={(data) =>
            router.push(
              paths.admin.roadmap.detail.replace("[roadmapId]", data.id)
            )
          }
        />
        <CustomPagination
          pagination={pagination}
          justifyContent='end'
          p={2}
          borderTop={1}
          borderColor={"divider"}
          rowsPerPageOptions={[10, 15, 20]}
        />
      </Paper>
    </Stack>
  );
};

export default RoadmapContent;
