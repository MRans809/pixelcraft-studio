export type Template = {
  id: string;
  title: string;
  category: string;
  coverUrl: string;
  description: string;
  requiredImageCount: number;
  acceptedMimeTypes: string[];
  maxFileSizeBytes: number;
};

export type Asset = {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  previewUrl: string;
};

export type TaskStatus = "QUEUED" | "PROCESSING" | "SUCCEEDED" | "FAILED";

export type CreationTask = {
  id: string;
  templateId: string;
  templateTitle: string;
  status: TaskStatus;
  stage: string;
  stageLabel: string;
  progress: number;
  failureReason?: string;
  resultUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export type User = {
  id: string;
  displayName: string;
  email: string;
  identityMode: string;
};

