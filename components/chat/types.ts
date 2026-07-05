"use client";

export type ChatToolId =
  | "patent-search"
  | "disclosure"
  | "search-formula"
  | "report"
  | "analysis";

export type WorkflowToolId = ChatToolId;

export interface UploadedFileMeta {
  name: string;
  size: number;
  type: string;
}

export type ChatSubmit =
  | {
      type: "chat";
      message: string;
      toolId?: ChatToolId;
    }
  | {
      type: "workflow";
      toolId: WorkflowToolId;
      files?: UploadedFileMeta[];
      message?: string;
    };
