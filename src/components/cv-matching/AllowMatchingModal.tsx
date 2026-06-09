"use client";
import { useState } from "react";
import { Sparkles, ShieldCheck, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface AllowMatchingModalProps {
  open: boolean;
  onClose: () => void;
  onActivated: () => Promise<void> | void;
}

export default function AllowMatchingModal({
  open,
  onClose,
  onActivated,
}: AllowMatchingModalProps) {
  const [loading, setLoading] = useState(false);

  const handleActivate = async () => {
    try {
      setLoading(true);
      await onActivated();
    } catch (err) {
      console.error("Kích hoạt tự động đối sánh thất bại:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <DialogTitle className="text-center text-lg font-bold">
            Kích hoạt Gợi ý Việc làm Thông minh
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-slate-500 dark:text-slate-400">
            Cho phép hệ thống tự động đối sánh CV mặc định của bạn với các vị
            trí tuyển dụng để hiển thị gợi ý phù hợp nhất trên Dashboard, Phân
            tích kỹ năng và trang Khuyến nghị.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 rounded-xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/40 dark:bg-blue-950/20">
          {[
            "Phân tích mức độ phù hợp giữa CV và thị trường",
            "Gợi ý công việc được cá nhân hóa theo kỹ năng của bạn",
            "Xác định khoảng cách kỹ năng cần bổ sung",
          ].map((text) => (
            <div key={text} className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
              <p className="text-xs text-blue-800 dark:text-blue-300">{text}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-[11px] text-slate-400">
          Bạn có thể tắt tính năng này bất kỳ lúc nào trong trang Cấu hình tài
          khoản.
        </p>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <button
            onClick={handleActivate}
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Đang kích hoạt..." : "Đồng ý kích hoạt"}
          </button>
          <button
            onClick={onClose}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <X className="h-3.5 w-3.5" />
            Bỏ qua
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
