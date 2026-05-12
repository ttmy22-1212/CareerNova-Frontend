import { InfoOutlined } from "@mui/icons-material";
import CustomTooltip from "./custom-tooltip";
import RowStack from "./row-stack";
import { Typography } from "@mui/material";

const DevelopmentTooltip = ({ children }: { children: React.ReactElement }) => {
  return (
    <CustomTooltip
      title={
        <RowStack gap={1}>
          <InfoOutlined />
          <Typography ml={1} variant="body2">
            Tính năng đang được phát triển
          </Typography>
        </RowStack>
      }
      placement="top"
    >
      {children}
    </CustomTooltip>
  );
};
export default DevelopmentTooltip;
