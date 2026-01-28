export type ArtifactType =
  | "code"
  | "config"
  | "schema"
  | "checklist"
  | "text"
  | "comparison";

export type RequirementField = {
  id: string;
  label: string;
  placeholder: string;
  required: boolean;
  type: "text" | "textarea" | "select";
  options?: string[];
};

export type RequirementsResponse = {
  needsMoreInfo: boolean;
  reason?: string;
  fields?: RequirementField[];
};

export type ExecutionStep = {
  id: string;
  title: string;
  artifactType: ArtifactType;
  instruction: string;
  artifact?: string;
  completed: boolean;
  skipped?: boolean; // New: track if step was skipped
};

export type ExecutionGraph = {
  goal: string;
  steps: ExecutionStep[];
  terminalState: "DONE";
  readonly compiled: true; // New: mark graph as immutable
};
