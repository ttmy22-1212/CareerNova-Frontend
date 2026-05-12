"use client"

import type React from "react"

import { useCallback, useState } from "react"
import { TextField, Box, useMediaQuery, useTheme } from "@mui/material"
import RowStack from "../../../../components/row-stack";
import SelectFilter from "./select-filter"

interface DashboardFiltersProps {
  onFilterChange: (filters: {
    fromDate: string
    toDate: string
    region: string
  }) => void
}

export default function DashboardFilters({ onFilterChange }: DashboardFiltersProps) {
  const [fromDate, setFromDate] = useState("2023-01-01")
  const [toDate, setToDate] = useState("2023-12-31")
  const [filter, setFilter] = useState({ region: "Tất cả" })
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const handleFilterChange = useCallback(() => {
    onFilterChange({
      fromDate,
      toDate,
      region: filter.region === "Tất cả" ? "all" : filter.region,
    })
  }, [fromDate, toDate, filter, onFilterChange])

  const handleFromDateChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFromDate(event.target.value)
      setTimeout(() => {
        handleFilterChange()
      }, 0)
    },
    [handleFilterChange],
  )

  const handleToDateChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setToDate(event.target.value)
      setTimeout(() => {
        handleFilterChange()
      }, 0)
    },
    [handleFilterChange],
  )

  const handleSelectChange = useCallback(
    (key: string, value: string) => {
      setFilter((prev) => ({ ...prev, [key]: value }))
      setTimeout(() => {
        handleFilterChange()
      }, 0)
    },
    [handleFilterChange],
  )

  const filterConfigs = [
    {
      label: "Khu vực",
      xs: 12,
      key: "region",
      options: [
        { value: "all", label: "Tất cả" },
        { value: "north", label: "Miền Bắc" },
        { value: "central", label: "Miền Trung" },
        { value: "south", label: "Miền Nam" },
      ],
    },
  ]

  return (
    <Box sx={{ width: isMobile ? "100%" : "auto" }}>
      <RowStack
        spacing={1}
        justifyContent="flex-end"
        sx={{
          flexDirection: isMobile ? "column" : "row",
          width: "100%",
        }}
      >
        <SelectFilter configs={filterConfigs} filter={filter} onChange={handleSelectChange} />
        <Box
          sx={{
            display: "flex",
            gap: 1,
            flexDirection: isMobile ? "column" : "row",
            width: isMobile ? "100%" : "auto",
          }}
        >
          <TextField
            id="from-date"
            label="Từ ngày"
            type="date"
            value={fromDate}
            onChange={handleFromDateChange}
            size="small"
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ width: isMobile ? "100%" : 150 }}
          />
          <TextField
            id="to-date"
            label="Đến ngày"
            type="date"
            value={toDate}
            onChange={handleToDateChange}
            size="small"
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ width: isMobile ? "100%" : 150 }}
          />
        </Box>
      </RowStack>
    </Box>
  )
}
