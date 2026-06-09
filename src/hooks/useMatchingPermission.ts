"use client";
import { useState, useEffect, useCallback } from "react";
import ProfileApi from "@/api/profile";

/**
 * Hook trả về trạng thái quyền tự động đối sánh CV và helper để cập nhật.
 *
 * - `allowed`: true nếu user đã cấp quyền, false nếu chưa, null khi đang tải.
 * - `showModal`: true khi cần hiển thị popup xin quyền.
 * - `dismissModal`: ẩn popup mà không kích hoạt.
 * - `activate`: gọi API bật quyền và cập nhật state.
 * - `deactivate`: gọi API tắt quyền.
 */
export function useMatchingPermission() {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    let cancelled = false;
    ProfileApi.getMe()
      .then((res) => {
        if (!cancelled && res.data) {
          const value = res.data.user.allow_default_cv_matching;
          if (typeof value === "boolean") {
            setAllowed(value);
            setShowModal(value === false);
          } else {
            setAllowed(null);
            setShowModal(false);
          }
        }
      })
      .catch(() => {
        if (!cancelled) setAllowed(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const activate = useCallback(async () => {
    await ProfileApi.updateCvMatchingPermission(true);
    setAllowed(true);
    setShowModal(false);
  }, []);

  const deactivate = useCallback(async () => {
    await ProfileApi.updateCvMatchingPermission(false);
    setAllowed(false);
  }, []);

  const dismissModal = useCallback(() => setShowModal(false), []);

  return { allowed, showModal, activate, deactivate, dismissModal };
}
