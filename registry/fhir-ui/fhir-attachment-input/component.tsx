"use client";

import * as React from "react";
import { Paperclip, File, X, Loader2, Eye, Pencil, Check } from "lucide-react";
import { type Attachment } from "@medplum/fhirtypes";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// Helper to split filename and extension safely
const splitFileName = (filename: string = "") => {
  const lastDotIndex = filename.lastIndexOf(".");
  if (lastDotIndex === -1 || lastDotIndex === 0) return { base: filename, ext: "" };
  return {
    base: filename.substring(0, lastDotIndex),
    ext: filename.substring(lastDotIndex + 1).toLowerCase()
  };
};

// Helper to get color based on extension
const getExtColor = (ext: string) => {
  switch (ext) {
    case "pdf": return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400";
    case "png":
    case "jpg":
    case "jpeg": return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400";
    case "doc":
    case "docx": return "bg-blue-50 text-blue-800 dark:bg-slate-900 dark:text-blue-300";
    case "xls":
    case "xlsx": return "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400";
    default: return "bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400";
  }
};

export interface FHIRAttachmentInputProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: Attachment;
  onChange?: (value?: Attachment) => void;
  showLabel?: boolean;
  label?: string;
  readOnly?: boolean;
  accept?: string;
  maxSizeMB?: number;
}

export function FHIRAttachmentInput({
  value,
  onChange,
  showLabel = false,
  label = "Attachment",
  readOnly = false,
  accept,
  maxSizeMB = 5,
  className,
  ...props
}: FHIRAttachmentInputProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [error, setError] = React.useState<string>();
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [editNameValue, setEditNameValue] = React.useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { base: fileBaseName, ext: fileExt } = splitFileName(value?.title);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (readOnly) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const processFile = async (file: File) => {
    if (readOnly) return;
    setError(undefined);

    if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds the limit of ${maxSizeMB}MB.`);
      return;
    }

    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Result is in format data:[<mediatype>][;base64],<data>
        const base64Data = result.split(',')[1];

        const attachment: Attachment = {
          contentType: file.type || "application/octet-stream",
          data: base64Data,
          title: file.name,
          size: file.size,
          creation: new Date().toISOString(),
        };

        onChange?.(attachment);
        setIsProcessing(false);
      };

      reader.onerror = () => {
        setError("Failed to read the file.");
        setIsProcessing(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      setError("An unexpected error occurred while processing the file.");
      setIsProcessing(false);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (readOnly) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processFile(file);
      e.dataTransfer.clearData();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (readOnly) return;
    onChange?.(undefined);
    setError(undefined);
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!value?.data) return;

    try {
      const byteCharacters = atob(value.data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: value.contentType || "application/octet-stream" });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch (err) {
      console.error("Failed to generate preview", err);
    }
  };

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (readOnly || !value) return;
    setEditNameValue(fileBaseName);
    setIsEditingName(true);
  };

  const handleSaveEdit = (e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    if (!value) return;
    const newTitle = fileExt ? `${editNameValue}.${fileExt}` : editNameValue;
    onChange?.({ ...value, title: newTitle });
    setIsEditingName(false);
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingName(false);
  };

  const formatSize = (bytes?: number) => {
    if (bytes === undefined) return "";
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div className={cn("w-full flex flex-col gap-2", className)} {...props}>
      {showLabel && <Label className="text-xs font-semibold text-muted-foreground">{label}</Label>}

      {!value ? (
        <div
          className={cn(
            "relative flex h-11 w-full items-center gap-2 rounded-md border border-dashed px-3 py-2 text-sm transition-colors",
            readOnly
              ? "bg-muted/50 opacity-70 cursor-not-allowed border-muted-foreground/30"
              : "cursor-pointer hover:bg-muted/50 hover:border-muted-foreground/50",
            isDragging && !readOnly
              ? "border-primary/50 bg-primary/5 text-primary"
              : "border-border text-muted-foreground",
            error && "border-destructive/50 bg-destructive/5 text-destructive"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !readOnly && fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept={accept}
            onChange={handleFileChange}
            disabled={readOnly || isProcessing}
          />

          <div className="flex w-full items-center justify-center gap-2">
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin shrink-0" />
            ) : (
              <Paperclip className="h-4 w-4 shrink-0" />
            )}
            <span className="truncate text-sm font-medium">
              {error || (isProcessing ? "Processing..." : "Click or drag to attach")}
            </span>
          </div>
        </div>
      ) : isEditingName ? (
        <div className={cn(
          "flex h-11 w-full items-center justify-between gap-2 rounded-md border bg-white px-2 py-1 text-sm shadow-sm transition-colors",
          "border-primary ring-1 ring-primary/20"
        )}>
          <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded font-bold text-[9px] uppercase tracking-wider", getExtColor(fileExt))}>
            {fileExt ? fileExt.substring(0, 4) : "?"}
          </div>
          <div className="flex-1 flex items-center bg-muted/30 border border-muted-foreground/20 rounded px-2 py-1 focus-within:border-primary/50 focus-within:bg-background">
            <input
              type="text"
              className="flex-1 border-none bg-transparent p-0 text-sm focus:outline-none focus:ring-0 min-w-0 text-foreground"
              value={editNameValue}
              onChange={(e) => setEditNameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveEdit(e);
                if (e.key === "Escape") handleCancelEdit(e as any);
              }}
              autoFocus
            />
            {fileExt && <span className="text-muted-foreground shrink-0 select-none">.{fileExt}</span>}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant="ghost"
              className="h-8 w-8 p-0 text-green-600 hover:bg-green-50 dark:hover:bg-green-950 rounded-sm"
              onClick={handleSaveEdit}
              title="Save"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0 text-muted-foreground hover:bg-muted hover:text-foreground rounded-sm"
              onClick={handleCancelEdit}
              title="Cancel"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex h-11 w-full items-center justify-between gap-3 rounded-md border border-border bg-card px-2 py-1.5 text-sm shadow-sm transition-colors hover:border-muted-foreground/40">
          <div className="flex items-center gap-3 overflow-hidden flex-1">
            <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded font-bold text-[10px] uppercase tracking-wider", getExtColor(fileExt))}>
              {fileExt ? fileExt.substring(0, 4) : "?"}
            </div>

            <div className="flex flex-col min-w-0 flex-1">
              <span className="truncate font-medium text-foreground leading-tight" title={value.title}>
                {value.title || "Document"}
              </span>
              {value.size !== undefined && (
                <span className="truncate text-[11px] text-muted-foreground leading-tight">
                  {formatSize(value.size)}
                </span>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-0.5">
            {value.data && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-600 dark:hover:text-blue-400 shrink-0"
                onClick={handlePreview}
                title="Preview file"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}

            {!readOnly && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground shrink-0"
                  onClick={handleStartEdit}
                  title="Rename file"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 dark:hover:text-red-400 shrink-0"
                  onClick={handleRemove}
                  title="Remove file"
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
