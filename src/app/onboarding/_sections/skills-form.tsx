"use client";

import type { FormikProps } from "formik";
import {
  Grid,
  Typography,
  Box,
  Chip,
  TextField,
  Button,
  Autocomplete,
  Paper,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useCallback, useMemo, useState } from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { UserOnboarding } from "@/types/user";
import { useMainContext } from "@/contexts/main/main-context";

interface SkillsFormProps {
  formik: FormikProps<UserOnboarding>;
}

const SkillsForm = ({ formik }: SkillsFormProps) => {
  const { getSkillsApi } = useMainContext();
  const [newSkill, setNewSkill] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<
    { id: string; name: string }[]
  >([]);

  const skills = useMemo(() => getSkillsApi.data || [], [getSkillsApi.data]);

  const handleAddSkill = useCallback(() => {
    if (newSkill.trim()) {
      const newSkillObj = { id: `custom-${Date.now()}`, name: newSkill.trim() };
      const updatedSkills = [...selectedSkills, newSkillObj];
      setSelectedSkills(updatedSkills);
      formik.setFieldValue("skills_have", updatedSkills);
      setNewSkill("");
    }
  }, [formik, newSkill, selectedSkills]);

  const handleSkillSelect = useCallback(
    (event: any, values: { id: string; name: string }[]) => {
      setSelectedSkills(values);
      formik.setFieldValue("skills_have", values);
    },
    [formik],
  );

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Kỹ năng
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Chọn những kỹ năng bạn đã có hoặc thêm kỹ năng mới
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Autocomplete
            multiple
            id="skills-select"
            options={skills}
            getOptionLabel={(option) => option.name}
            value={selectedSkills}
            onChange={handleSkillSelect}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label="Kỹ năng của bạn"
                placeholder="Tìm kiếm kỹ năng..."
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={option.name}
                  {...getTagProps({ index })}
                  key={`${option.id}-${index}`}
                  color="primary"
                  variant="outlined"
                />
              ))
            }
          />
        </Grid>

        {/* <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            Thêm kỹ năng mới
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              variant="outlined"
              fullWidth
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Nhập kỹ năng mới..."
              size="small"
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddSkill}
              disabled={!newSkill.trim()}
            >
              Thêm
            </Button>
          </Box>
        </Grid> */}

        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: { xs: 1, sm: 2 }, mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Kỹ năng đã chọn ({selectedSkills.length})
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: { xs: 0.5, sm: 1 },
              }}
            >
              {selectedSkills.length > 0 ? (
                selectedSkills.map((skill) => (
                  <Chip
                    key={skill.id}
                    label={skill.name}
                    color="primary"
                    size={isSmallScreen ? "small" : "medium"}
                    onDelete={() => {
                      const updatedSkills = selectedSkills.filter(
                        (s) => s.id !== skill.id,
                      );
                      setSelectedSkills(updatedSkills);
                      formik.setFieldValue(
                        "skills_have",
                        updatedSkills.map((s) => s.id),
                      );
                    }}
                    sx={{ mb: 1, mr: 1 }}
                  />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Bạn chưa chọn kỹ năng nào
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SkillsForm;
