"use client";

import React, { useState, useRef } from "react";
import { FileUp, CheckCircle2, AlertCircle, Loader2, X } from "lucide-react";
import CvApi from "@/api/cv";

interface CVUploadProps {
  onUpload?: (file: File) => void;
  existingCV?: string;
}

export function CVUpload({ onUpload, existingCV }: CVUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    // Validate file type
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!validTypes.includes(selectedFile.type)) {
      setErrorMessage(
        "Please upload a PDF or Word document (.pdf, .doc, .docx)",
      );
      setUploadStatus("error");
      setTimeout(() => setUploadStatus("idle"), 5000);
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setErrorMessage("File size must be less than 5MB");
      setUploadStatus("error");
      setTimeout(() => setUploadStatus("idle"), 5000);
      return;
    }

    setFile(selectedFile);
    setUploadStatus("idle");
    setErrorMessage("");
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsLoading(true);
    setUploadStatus("idle");
    setErrorMessage("");

    try {
      const response = await CvApi.uploadCv(file);

      if (response && response.data) {
        setUploadStatus("success");
        if (onUpload) {
          onUpload(file);
        }
      } else {
        setUploadStatus("error");
        setErrorMessage(
          response?.message || "Tải CV lên thất bại. Vui lòng thử lại.",
        );
      }
    } catch (error: any) {
      console.error("Lỗi khi upload CV:", error);
      setUploadStatus("error");
      setErrorMessage(
        error?.message || "Có lỗi hệ thống xảy ra trong quá trình tải lên.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Status Messages */}
      {uploadStatus === "success" && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900/30 dark:bg-green-900/20 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-green-900 dark:text-green-300">
              CV Uploaded Successfully
            </h3>
            <p className="text-sm text-green-800 dark:text-green-200">
              Your CV has been parsed and skills extracted.
            </p>
          </div>
        </div>
      )}

      {uploadStatus === "error" && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/30 dark:bg-red-900/20 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-900 dark:text-red-300">
              Upload Failed
            </h3>
            <p className="text-sm text-red-800 dark:text-red-200">
              {errorMessage}
            </p>
          </div>
        </div>
      )}

      {/* Upload Area */}
      {!file || uploadStatus !== "idle" ? (
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-all ${
            isDragging
              ? "border-violet-500 bg-violet-50 dark:border-violet-500 dark:bg-violet-900/20"
              : "border-slate-300 bg-slate-50 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900/50 dark:hover:border-slate-600"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileInputChange}
            accept=".pdf,.doc,.docx"
            className="hidden"
          />

          <div className="flex flex-col items-center gap-2">
            <div className="rounded-full bg-violet-100 p-3 dark:bg-violet-900/30">
              <FileUp className="h-6 w-6 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">
                {isDragging ? "Drop your CV here" : "Drag & drop your CV"}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                or click to browse • PDF, DOC, DOCX (max 5MB)
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-slate-200 p-2 dark:bg-slate-800">
                <FileUp className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-900 dark:text-white text-sm truncate">
                  {file.name}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <button
              onClick={() => setFile(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Upload Button */}
      {file && uploadStatus === "idle" && (
        <button
          onClick={handleUpload}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-6 py-3 font-semibold text-white hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {isLoading ? "Uploading..." : "Upload CV"}
        </button>
      )}

      {/* Existing CV Info */}
      {existingCV && uploadStatus !== "success" && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-900/20">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                CV on file
              </p>
              <p className="text-xs text-blue-800 dark:text-blue-200">
                Your current CV:{" "}
                <span className="font-medium">{existingCV}</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
