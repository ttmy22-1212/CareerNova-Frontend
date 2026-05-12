import { Box, Button, Stack, Typography } from "@mui/material";
import React, { useState } from "react";
import { CustomerFilterProps, CustomFilterItemConfig } from "./custom-filter";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { SingleSelectOptionProps } from "./single-select-option";

function MultipleSelectOption<T>({
  filter,
  onChange,
  config,
}: SingleSelectOptionProps<T>) {
  const [showMore, setShowMore] = useState(false);

  const optionsToShow = showMore
    ? config.options
    : config.options?.slice(0, config?.maxLengthToShow);

  return (
    <Stack flexDirection="row" alignItems="center" gap="12px" flexWrap="wrap">
      {optionsToShow?.map((option) => (
        <Box
          key={option.value}
          onClick={() =>
            onChange({
              ...filter,
              [config.key]:
                Array.isArray(filter[config.key]) &&
                (filter[config.key] as (string | undefined)[]).includes(
                  option.value,
                )
                  ? (filter[config.key] as (string | undefined)[]).filter(
                      (val) => val !== option.value,
                    )
                  : [
                      ...((filter[config.key] as (string | undefined)[]) || []),
                      option.value,
                    ],
            })
          }
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "7px 10px",
            backgroundColor:
              Array.isArray(filter[config.key]) &&
              (filter[config.key] as (string | undefined)[]).includes(
                option.value,
              )
                ? "primary.main"
                : "#11192714",
            borderRadius: "12px",
            height: "32px",
            border: "1px solid #DFE4EC",
            cursor: "pointer",
            color:
              Array.isArray(filter[config.key]) &&
              (filter[config.key] as (string | undefined)[]).includes(
                option.value,
              )
                ? "#FFF"
                : "secondary.main",
          }}
        >
          <Typography
            fontSize={"14px"}
            fontWeight={500}
            color={
              Array.isArray(filter[config.key]) &&
              (filter[config.key] as (string | undefined)[]).includes(
                option.value,
              )
                ? "#FFF"
                : "secondary.main"
            }
          >
            {option.label}
          </Typography>
        </Box>
      ))}
      {config.options &&
        config.maxLengthToShow &&
        config.options.length > config.maxLengthToShow && (
          <Button onClick={() => setShowMore(!showMore)}>
            {showMore ? "Ẩn bớt" : "Thêm"}
            <ArrowDropDownIcon />
          </Button>
        )}
    </Stack>
  );
}

export default MultipleSelectOption;
