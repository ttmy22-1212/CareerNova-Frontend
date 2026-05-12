import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import { Button, Stack, Theme, useMediaQuery } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CustomerFilterProps, CustomFilterItemConfig } from "../custom-filter";
import MultipleSelectDialog from "./multiple-select-dialog";
import { getAllChildrenValues, OptionsWithChildren } from "./type";
import { useDialog } from "@/hooks/use-dialog";
import { logEvent } from "firebase/analytics";
import { analytics } from "@/libs/firebase";
import MultipleSelectChip from "../multiple-select-chip";

export interface DeepMultipleSelectProps<T>
  extends Omit<CustomerFilterProps<T>, "configs" | "GridContainerProps"> {
  config: CustomFilterItemConfig<T>;
}

function DeepMultipleSelect<T>({
  filter,
  onChange,
  config,
}: DeepMultipleSelectProps<T>) {
  const dialog = useDialog<OptionsWithChildren>();
  const isLgDown = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("lg"),
  );
  const [value, setValue] = useState<string[] | undefined>(
    filter[config.key] as string[] | undefined,
  );

  const [showMoreMultiple, setShowMoreMultiple] = useState<{
    [key: string]: boolean;
  }>({});

  const showMore = showMoreMultiple[String(config.key)];

  const optionsToShow = useMemo(
    () =>
      showMore || isLgDown
        ? config.options
        : config.options?.slice(0, config?.maxLengthToShow || 6),
    [isLgDown, showMore, config.options, config.maxLengthToShow],
  );

  const handleShowMoreMultiple = useCallback((key: keyof T) => {
    setShowMoreMultiple((prev) => ({
      ...prev,
      [String(key)]: !prev[String(key)],
    }));
  }, []);

  const handleSelectChip = useCallback(
    (option: OptionsWithChildren) => {
      let newValue = [...(value || [])];
      if (newValue.includes(option.value)) {
        const childrenValues = [option.value, ...getAllChildrenValues(option)];
        newValue = newValue.filter((v) => !childrenValues.includes(v));
      } else {
        newValue.push(option.value);
      }
      onChange({ ...filter, [config.key]: newValue });
    },
    [config.key, filter, onChange, value],
  );

  useEffect(() => {
    setValue(filter[config.key] as string[] | undefined);
  }, [filter, config.key]);

  useEffect(() => {
    if (dialog.open && analytics) {
      logEvent(analytics, "deep_filter", {
        config: config.key,
        data: dialog.data?.label,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialog.open, config]);

  return (
    <Stack direction={"row"}>
      <Stack
        flexDirection="row"
        alignItems="center"
        gap={{ xs: 1, md: 1.5 }}
        flexWrap="wrap"
        flex={1}
      >
        {optionsToShow?.map((option) => (
          <MultipleSelectChip
            key={option.value}
            onClick={() => handleSelectChip(option)}
            onSettingClick={() => dialog.handleOpen(option)}
            value={option.label}
            selected={value?.includes(option.value)}
          ></MultipleSelectChip>
        ))}
        <MultipleSelectDialog
          open={dialog.open}
          option={dialog.data}
          onClose={dialog.handleClose}
          value={value || []}
          onSubmit={(value) => {
            onChange({ ...filter, [config.key]: value });
          }}
        />
      </Stack>
      {!isLgDown &&
        config.options &&
        config.maxLengthToShow &&
        config.options.length > config.maxLengthToShow && (
          <Button
            onClick={() => handleShowMoreMultiple(config.key)}
            sx={{ alignSelf: "flex-start" }}
          >
            {showMore ? (
              <>
                Ẩn <ArrowDropUpIcon />
              </>
            ) : (
              <>
                Thêm <ArrowDropDownIcon />
              </>
            )}
          </Button>
        )}
    </Stack>
  );
}

export default DeepMultipleSelect;
