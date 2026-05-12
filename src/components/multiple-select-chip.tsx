import {
  Box,
  Chip,
  Stack,
  SvgIcon,
  Theme,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { Setting2 } from "iconsax-react";
import RowStack from "./row-stack";

interface MultipleSelectChipProps {
  value: string;
  onClick: () => void;
  onSettingClick: () => void;
  selected?: boolean;
}

const SettingIcon = ({
  onClick,
}: {
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
}) => (
  <Box
    sx={{
      borderRadius: "6px",
      backgroundColor: "white",
      boxShadow: "0px 4px 5.3px 0px rgba(0, 0, 0, 0.20)",
      width: "26px",
      height: "26px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      cursor: "pointer",
    }}
    onClick={onClick}
  >
    <SvgIcon color="primary">
      <Setting2 variant="Bold" />
    </SvgIcon>
  </Box>
);

const MultipleSelectChip = ({
  value,
  onClick,
  onSettingClick,
  selected,
}: MultipleSelectChipProps) => {
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up("md"));

  if (!smUp) {
    return (
      <Stack
        direction="row"
        justifyContent="space-between"
        sx={{
          p: 1.5,
          borderRadius: "14px",
          border: 1,
          borderColor: selected ? "primary.main" : "divider",
          bgcolor: selected ? "primary.lightest" : "white",
          width: "100%",
        }}
        onClick={onClick}
      >
        <RowStack alignItems={"center"}>
          <Typography
            variant="caption"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              textWrap: "wrap",
            }}
          >
            {value}
          </Typography>
        </RowStack>

        {selected && (
          <SettingIcon
            onClick={(e: React.MouseEvent<HTMLElement>) => {
              e.stopPropagation();
              onSettingClick();
            }}
          />
        )}
      </Stack>
    );
  }

  return (
    <Chip
      variant="filled"
      color={selected ? "primary" : "default"}
      onClick={onClick}
      sx={{
        padding: "6px 8px",
        borderRadius: "12px",
        gap: 1,
        height: "38px",
        "& .MuiChip-label": {
          padding: 0,
        },
        "& .MuiChip-deleteIcon": {
          marginLeft: "8px",
          marginRight: "0",
        },
      }}
      label={value}
      onDelete={onSettingClick}
      deleteIcon={selected ? <SettingIcon /> : <></>}
    ></Chip>
  );
};

export default MultipleSelectChip;
