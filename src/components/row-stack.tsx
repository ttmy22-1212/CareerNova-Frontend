import { Stack, StackProps } from "@mui/material";
import React from "react";

const RowStack = (props: StackProps) => {
  return <Stack direction="row" alignItems="center" {...props}></Stack>;
};

export default RowStack;
