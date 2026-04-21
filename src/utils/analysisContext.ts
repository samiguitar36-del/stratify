import type { AnalysisContext } from "../types/finance";

const toIsoDate = (value: Date) => value.toISOString().slice(0, 10);

export const createEmptyAnalysisContext = (date = new Date()): AnalysisContext => ({
  clientName: "",
  projectName: "",
  advisorName: "",
  analysisDate: toIsoDate(date),
  executiveNotes: "",
  finalRecommendation: "",
  tags: [],
});

export const normalizeAnalysisContext = (value: unknown): AnalysisContext => {
  if (!value || typeof value !== "object") {
    return createEmptyAnalysisContext();
  }

  const context = value as Partial<AnalysisContext>;

  return {
    clientName: typeof context.clientName === "string" ? context.clientName : "",
    projectName: typeof context.projectName === "string" ? context.projectName : "",
    advisorName: typeof context.advisorName === "string" ? context.advisorName : "",
    analysisDate:
      typeof context.analysisDate === "string" && context.analysisDate
        ? context.analysisDate
        : createEmptyAnalysisContext().analysisDate,
    executiveNotes: typeof context.executiveNotes === "string" ? context.executiveNotes : "",
    finalRecommendation:
      typeof context.finalRecommendation === "string" ? context.finalRecommendation : "",
    tags: Array.isArray(context.tags)
      ? context.tags
          .filter((tag): tag is string => typeof tag === "string")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [],
  };
};

export const parseTagsInput = (value: string) =>
  value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

export const formatTagsInput = (tags: string[]) => tags.join(", ");
