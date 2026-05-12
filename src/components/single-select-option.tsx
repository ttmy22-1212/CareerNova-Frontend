import { Box, Button, Stack, Typography } from "@mui/material";
import React, { useState } from "react";
import { CustomerFilterProps, CustomFilterItemConfig } from "./custom-filter";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

export interface SingleSelectOptionProps<T>
  extends Omit<CustomerFilterProps<T>, "configs" | "GridContainerProps"> {
  config: CustomFilterItemConfig<T>;
}

function SingleSelectOption<T>({
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
      {optionsToShow?.map((option) => (
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
              filter[config.key] === option.value
                ? "primary.main"
                : "#11192714",
            borderRadius: "12px",
            height: "32px",
            border: "1px solid #DFE4EC",
            cursor: "pointer",
            color:
              filter[config.key] === option.value ? "#FFF" : "secondary.main",
          }}
        >
          <Typography
            fontSize={"14px"}
            fontWeight={500}
            color={
              filter[config.key] === option.value ? "#FFF" : "secondary.main"
            }
          >
            {option.label}
          </Typography>
        </Box>
      ))}
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

export default SingleSelectOption;
