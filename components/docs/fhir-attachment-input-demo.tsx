"use client";

import React, { useState } from "react";
import { FHIRAttachmentInput } from "@/registry/fhir-ui/fhir-attachment-input";
import { type Attachment } from "@medplum/fhirtypes";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function FHIRAttachmentInputDemo() {
  const [value, setValue] = useState<Attachment | undefined>();
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [readOnly, setReadOnly] = useState(false);
  const [showLabel, setShowLabel] = useState(true);
  const [acceptFilter, setAcceptFilter] = useState("all");
  const [demoMode, setDemoMode] = useState<"single" | "multiple">("single");

  const getAcceptString = () => {
    switch (acceptFilter) {
      case "images": return "image/*";
      case "documents": return ".pdf,.doc,.docx,application/pdf";
      default: return undefined;
    }
  };

  const handleAddMultiple = (newAttachment?: Attachment) => {
    if (newAttachment) {
      setAttachments([...attachments, newAttachment]);
    }
  };

  const handleUpdateOrRemoveMultiple = (index: number, updatedVal?: Attachment) => {
    if (!updatedVal) {
      setAttachments(attachments.filter((_, idx) => idx !== index));
    } else {
      const newAttachments = [...attachments];
      newAttachments[index] = updatedVal;
      setAttachments(newAttachments);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl">
      {/* Config Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-muted/30 rounded-xl border border-border/80">
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Allowed Types
            </label>
            <Select value={acceptFilter} onValueChange={setAcceptFilter}>
              <SelectTrigger className="h-8 text-xs font-mono">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Format</SelectItem>
                <SelectItem value="images">Images Only</SelectItem>
                <SelectItem value="documents">Documents (PDF, Word)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Demo Mode
            </label>
            <Select value={demoMode} onValueChange={(v) => setDemoMode(v as "single" | "multiple")}>
              <SelectTrigger className="h-8 text-xs font-mono">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single File</SelectItem>
                <SelectItem value="multiple">Multiple Files</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="att-demo-label-checkbox"
              checked={showLabel}
              onCheckedChange={(checked) => setShowLabel(!!checked)}
            />
            <label
              htmlFor="att-demo-label-checkbox"
              className="text-xs font-medium leading-none select-none cursor-pointer whitespace-nowrap"
            >
              Show Label
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="att-demo-readonly-checkbox"
              checked={readOnly}
              onCheckedChange={(checked) => setReadOnly(!!checked)}
            />
            <label
              htmlFor="att-demo-readonly-checkbox"
              className="text-xs font-medium leading-none select-none cursor-pointer whitespace-nowrap"
            >
              Read Only
            </label>
          </div>
        </div>
      </div>

      {/* Single File Demo */}
      {demoMode === "single" && (
        <>
          <div className="p-6 bg-background border border-border rounded-xl space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Single Attachment</h3>
              <p className="text-xs text-muted-foreground">Perfect for fields like patient photos or single documents.</p>
            </div>
            <FHIRAttachmentInput
              value={value}
              onChange={setValue}
              showLabel={showLabel}
              label="Identity Document (KTP / Passport)"
              readOnly={readOnly}
              accept={getAcceptString()}
              maxSizeMB={2}
            />
          </div>

          <div className="w-full p-4 bg-muted/40 rounded-lg overflow-auto max-h-[300px] border border-border">
            <div className="font-semibold text-muted-foreground mb-2 flex items-center justify-between text-xs">
              <span>onChange Output</span>
              <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-sans">
                Attachment
              </span>
            </div>
            <pre className="text-xs text-foreground whitespace-pre-wrap font-mono max-h-[220px] scrollbar-thin overflow-y-auto">
              {value ? JSON.stringify(
                {
                  ...value,
                  data: value.data ? `${value.data.substring(0, 50)}... (truncated)` : undefined
                },
                null, 2
              ) : "undefined"}
            </pre>
          </div>
        </>
      )}

      {/* Multiple Files Demo */}
      {demoMode === "multiple" && (
        <>
          <div className="p-6 bg-background border border-border rounded-xl space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Multiple Attachments</h3>
              <p className="text-xs text-muted-foreground">Add multiple documents. Use the empty slot to add more files.</p>
            </div>
            <div className="space-y-2">
              {attachments.map((att, index) => (
                <FHIRAttachmentInput
                  key={index}
                  value={att}
                  onChange={(val) => handleUpdateOrRemoveMultiple(index, val)}
                  readOnly={readOnly}
                  accept={getAcceptString()}
                  maxSizeMB={5}
                />
              ))}
              <FHIRAttachmentInput
                onChange={handleAddMultiple}
                readOnly={readOnly}
                accept={getAcceptString()}
                maxSizeMB={5}
                showLabel={attachments.length === 0 && showLabel}
                label="Supporting Documents"
              />
            </div>
          </div>

          <div className="w-full p-4 bg-muted/40 rounded-lg overflow-auto max-h-[300px] border border-border">
            <div className="font-semibold text-muted-foreground mb-2 flex items-center justify-between text-xs">
              <span>Attachments Array ({attachments.length} items)</span>
              <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-sans">
                Attachment[]
              </span>
            </div>
            <pre className="text-xs text-foreground whitespace-pre-wrap font-mono max-h-[220px] scrollbar-thin overflow-y-auto">
              {attachments.length === 0
                ? "[]"
                : JSON.stringify(
                    attachments.map(a => ({
                      title: a.title,
                      contentType: a.contentType,
                      size: a.size,
                      data: a.data ? `${a.data.substring(0, 30)}... (truncated)` : undefined
                    })),
                    null,
                    2
                  )}
            </pre>
          </div>
        </>
      )}
    </div>
  );
}
