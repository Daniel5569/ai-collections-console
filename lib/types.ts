export type RiskLevel = "Low" | "Medium" | "High" | "Critical";

export type AccountStatus =
  | "Needs review"
  | "Ready to send"
  | "Payment plan"
  | "Escalation hold"
  | "Low touch"
  | "Approved";

export interface Account {
  id: string;
  company: string;
  contact: string;
  balance: number;
  daysPastDue: number;
  status: AccountStatus;
  risk: RiskLevel;
  recoveryScore: number;
  recoveryLikelihood: number;
  reason: string;
  owner: string;
  // Display / presentation fields — optional so model tests stay lean
  channel?: string;
  proposedPlan?: string;
  suggestedAction?: string;
  draft?: string;
  nextStep?: string;
  // Runtime state added by seedAccountState
  originalStatus?: AccountStatus;
  previousStatus?: AccountStatus;
  approvedAction?: boolean;
}

export interface AuditEntry {
  time: string;
  account: string;
  action: string;
  actor: string;
  outcome: string;
}

export type FilterOption =
  | "All"
  | "Needs review"
  | "Ready to send"
  | "Payment plan"
  | "Escalation hold"
  | "Approved";

export type SortOption = "risk" | "balance" | "age" | "recovery";

export interface FilterState {
  filter: FilterOption;
  search: string;
  sort: SortOption;
}

export interface Metrics {
  totalBalance: number;
  expectedRecovery: number;
  reviewCount: number;
  highRiskCount: number;
}
