export interface HazardData {
  name: string;
  severity: "critical" | "high" | "medium";
  location: string;
  description: string;
}

export interface AnalysisResult {
  environment_summary: string;
  hazards: HazardData[];
  entry_recommendation: string;
  time_constraint: string;
  equipment_required: string[];
}
