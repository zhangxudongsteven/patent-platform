// types.ts
export interface ContentBlock {
  id: string;
  type: "text" | "image";
  content: string;
  imageUrl?: string;
  detectionResult?: ImageDetectionResult;
  isDetecting?: boolean;
}

export interface KeywordDefinition {
  term: string;
  definition: string;
}

export interface AIWarning {
  type: "unclear" | "brief" | "image" | "problem" | string;
  message: string;
}

export interface ProblemDetectionResult {
  problems: string[];
  hasProblems: boolean;
}

export interface ImageDetectionResult {
  isWhiteBackground: boolean;
  isBlackLines: boolean;
  pass: boolean;
  reason: string;
}

export type Step = 1 | 2 | 3 | 4 | 5;
