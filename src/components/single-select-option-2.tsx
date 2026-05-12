import { Box, Button, Stack, Typography } from "@mui/material";
import React, { useState } from "react";
import { CustomerFilterProps, CustomFilterItemConfig } from "./custom-filter";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { SingleSelectOptionProps } from "./single-select-option";

function SingleSelectOption2<T>({
  filter,
  onChange,
  config,
}: SingleSelectOptionProps<T>) {
  const [showMoreSingle, setShowMoreSingle] = useState<{
    [key: string]: boolean;
  }>({});

  const showMore = showMoreSingle[String(config.key)];

  const optionsToShow = showMore
    ? config.options
    : config.options?.slice(0, config?.maxLengthToShow);

  const handleShowMoreSingle = (key: keyof T) => {
    setShowMoreSingle((prev) => ({
      ...prev,
      [String(key)]: !prev[String(key)],
    }));
  };

  return (
    <Stack flexDirection="row" alignItems="center" gap="12px" flexWrap="wrap">
      {optionsToShow?.map((option, index) => {
        const isFirst = index === 0;
        const isLast = index === optionsToShow.length - 1;

        return (
          <Box
            key={option.value}
            onClick={() =>
              onChange({
                ...filter,
                [config.key]:
                  filter[config.key] === option.value ? "" : option.value,
              })
            }
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "7px 10px",
              backgroundColor:
                filter[config.key] === option.value ? "primary.main" : "#FFF",
              height: "32px",
              border: "1px solid #2970ff",
              cursor: "pointer",
              color:
                filter[config.key] === option.value ? "#FFF" : "primary.main",
              borderRadius: isFirst
                ? "16px 0 0 16px"
                : isLast
                  ? "0 16px 16px 0"
                  : "0",
            }}
          >
            <Typography
              fontSize={"14px"}
              fontWeight={500}
              color={
                filter[config.key] === option.value ? "#FFF" : "primary.main"
              }
            >
              {option.label}
            </Typography>
          </Box>
        );
      })}
      {config.options &&
        config.maxLengthToShow &&
        config.options.length > config.maxLengthToShow && (
          <Button onClick={() => handleShowMoreSingle(config.key)}>
            {showMore ? "Ẩn bớt" : "Thêm"}
            <ArrowDropDownIcon />
          </Button>
        )}
    </Stack>
  );
}

export default SingleSelectOption2;
