"use client";

import type { FormikProps } from "formik";
import {
  Grid,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import SchoolIcon from "@mui/icons-material/School";
import FlagIcon from "@mui/icons-material/Flag";
import BuildIcon from "@mui/icons-material/Build";
import WorkIcon from "@mui/icons-material/Work";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import WcIcon from "@mui/icons-material/Wc";
import { UserOnboarding } from "@/types/user";
import { formatDate } from "@/utils/date-helper";
import { useMainContext } from "@/contexts/main/main-context";
import { useMemo } from "react";

interface ReviewFormProps {
  formik: FormikProps<UserOnboarding>;
}

// Hàm chuyển đổi giới tính sang tiếng Việt
const formatGender = (gender: string | null) => {
  switch (gender) {
    case "male":
      return "Nam";
    case "female":
      return "Nữ";
    case "other":
      return "Khác";
    default:
      return "Không xác định";
  }
};

const ReviewForm = ({ formik }: ReviewFormProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { getSkillsApi } = useMainContext();

  const skills = useMemo(() => getSkillsApi.data || [], [getSkillsApi.data]);

  // Lấy tên kỹ năng từ ID
  const getSkillNames = () => {
    return formik.values.skills_have.map((skillId) => {
      const skill = skills.find((s) => s.id === s.id);
      return skill ? skill.name : `Kỹ năng #${skillId}`;
    });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Xem lại thông tin
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Vui lòng kiểm tra lại tất cả thông tin trước khi hoàn tất
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PersonIcon color="primary" />
                <Typography variant="subtitle1" fontWeight="medium">
                  Thông tin cá nhân
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List dense disablePadding>
                <ListItem>
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Họ và tên"
                    secondary={formik.values.full_name || "Chưa cung cấp"}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CalendarTodayIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Ngày sinh"
                    secondary={
                      formik.values.date_of_birth
                        ? formatDate(formik.values.date_of_birth)
                        : "Chưa cung cấp"
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <WcIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Giới tính"
                    secondary={formatGender(formik.values.gender)}
                  />
                </ListItem>
              </List>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <SchoolIcon color="primary" />
                <Typography variant="subtitle1" fontWeight="medium">
                  Học vấn
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List dense disablePadding>
                <ListItem>
                  <ListItemText
                    primary="Trình độ học vấn"
                    secondary={formik.values.education_level || "Chưa cung cấp"}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Chuyên ngành"
                    secondary={formik.values.major || "Chưa cung cấp"}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Trường học"
                    secondary={formik.values.school || "Chưa cung cấp"}
                  />
                </ListItem>
              </List>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <FlagIcon color="primary" />
                <Typography variant="subtitle1" fontWeight="medium">
                  Mục tiêu nghề nghiệp
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">
                {formik.values.current_goal || "Chưa cung cấp"}
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <BuildIcon color="primary" />
                <Typography variant="subtitle1" fontWeight="medium">
                  Kỹ năng ({formik.values.skills_have.length})
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {formik.values.skills_have.length > 0 ? (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {getSkillNames().map((skillName, index) => (
                    <Chip key={index} label={skillName} size="small" />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Chưa có kỹ năng nào được chọn
                </Typography>
              )}
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <WorkIcon color="primary" />
                <Typography variant="subtitle1" fontWeight="medium">
                  Kinh nghiệm làm việc ({formik.values.experience?.length || 0})
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {formik.values.experience &&
              formik.values.experience.length > 0 ? (
                <List dense disablePadding>
                  {formik.values.experience.map((exp, index) => (
                    <Paper key={index} variant="outlined" sx={{ p: 2, mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        {exp.job_title || "Chưa có chức danh"}{" "}
                        {exp.field ? `- ${exp.field}` : ""}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {exp.years} năm kinh nghiệm
                      </Typography>
                    </Paper>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Chưa có kinh nghiệm làm việc nào được thêm
                </Typography>
              )}
            </AccordionDetails>
          </Accordion>
        </Grid>

        <Grid item xs={12}>
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              mt: 2,
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Xác nhận thông tin
            </Typography>
            <Typography variant="body2" paragraph>
              Vui lòng kiểm tra lại tất cả thông tin trước khi hoàn tất. Sau khi
              gửi, thông tin của bạn sẽ được phân tích để đưa ra gợi ý nghề
              nghiệp phù hợp nhất.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReviewForm;
