"use client";

import { Grid, Stack, Paper } from "@mui/material";
import ProfileSidebar from "@/app/(user)/forum/_sections/profile-sidebar";
import PostCreator from "@/app/(user)/forum/_sections/post-creater";
import PostList from "@/app/(user)/forum/_sections/post-list";
import { PostProvider } from "@/contexts/forum/post-context";
import { CommentProvider } from "@/contexts/forum/comment-context"; // Nếu cần hiển thị bình luận

const CareerContent = () => {
  return (
    <PostProvider>
      <CommentProvider>
        <Stack>
          <Grid container spacing={2}>
            {/* Left sidebar - Profile */}
            <Grid
              item
              xs={12}
              md={4}
              order={{ xs: 1, md: 1 }}
              sx={{
                height: { xs: "250px", md: "auto" },
              }}
            >
              <ProfileSidebar />
            </Grid>



            {/* Main content - Posts */}
            <Grid item xs={12} md={8} order={{ xs: 3, md: 2 }}>
              <Paper sx={{ p: 2, mb: 2 }}>
                <PostCreator />
              </Paper>
              <PostList tab="default" />
            </Grid>
          </Grid>
        </Stack>
      </CommentProvider>
    </PostProvider>
  );
};

export default CareerContent;
