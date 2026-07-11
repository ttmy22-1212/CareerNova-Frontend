import { redirect } from "next/navigation";

/**
 * Trang Đề xuất đã được gộp vào Tổng quan (/my-dashboard).
 * Redirect vĩnh viễn để URL cũ không bị trống.
 */
export default function Page() {
  redirect("/my-dashboard");
}
