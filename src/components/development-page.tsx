import { Stack, Typography } from "@mui/material";
import { Box, Container } from "@mui/system";
import RowStack from "./row-stack";

export default function OnDevelopmentPage() {
  return (
    <>
      <Container maxWidth='lg'>
        <RowStack
          sx={{
            justifyContent: "center",
          }}
        >
          <Stack
            sx={{
              gap: "36px",
              marginY: "100px",
            }}
          >
            <Stack
              sx={{
                gap: 1,
                alignItems: "center",
              }}
            >
              <RowStack
                sx={{
                  backgroundColor: "neutral.800",
                  borderRadius: 16,
                  gap: 0.25,
                  justifyContent: "center",
                  padding: "8px 16px",
                  border: "1px solid #384250",
                  width: "fit-content",
                }}
              >
                <Typography
                  variant='subtitle1'
                  color={"secondary.light"}
                  textAlign={"center"}
                  fontSize={16}
                  fontWeight={500}
                >
                  Tính năng đang được chúng tôi phát triển
                </Typography>
                <Box
                  component='img'
                  sx={{ height: 32, width: 32 }}
                  alt='rocket'
                  src={"/assets/rocket.gif"}
                />
              </RowStack>
            </Stack>

            <Stack
              sx={{
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Box
                component='img'
                sx={{ height: "100%", width: "100%" }}
                alt='pic1'
                src={"/assets/rocket.gif"}
              />
            </Stack>
          </Stack>
        </RowStack>
      </Container>
    </>
  );
}
