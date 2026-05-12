import React, { useState, useCallback, useEffect } from "react";
import { Tooltip, TooltipProps, ClickAwayListener } from "@mui/material";

interface CustomTooltipProps extends TooltipProps {}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  children,
  ...props
}) => {
  const [open, setOpen] = useState(false);

  const handleClick = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const handleClickAway = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    if (open) {
      const timeout = setTimeout(() => setOpen(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <div>
        <Tooltip {...props} open={open} arrow>
          <span onClick={handleClick} style={{ cursor: "pointer" }}>
            {children}
          </span>
        </Tooltip>
      </div>
    </ClickAwayListener>
  );
};

export default CustomTooltip;
