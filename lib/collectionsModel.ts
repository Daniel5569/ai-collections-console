import type { Account, FilterState, Metrics, RiskLevel } from "./types";

const riskRank: Record<RiskLevel, number> = {
  Low: 1,
  Medium: 2,
  High: 3,
  Critical: 4
};

export function filterAccounts(
  accounts: Account[],
  { filter = "All", search = "", sort = "risk" }: Partial<FilterState> = {}
): Account[] {
  const normalizedSearch = search.trim().toLowerCase();
  const visible = accounts.filter((account) => {
    const matchesFilter =
      filter === "All" ||
      account.status === filter ||
      (filter === "Approved" && account.approvedAction);
    const matchesSearch =
      normalizedSearch.length === 0 ||
      [account.id, account.company, account.contact, account.owner, account.reason]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
    return matchesFilter && matchesSearch;
  });

  return [...visible].sort((left, right) => {
    if (sort === "balance") return right.balance - left.balance;
    if (sort === "age") return right.daysPastDue - left.daysPastDue;
    if (sort === "recovery") return right.recoveryScore - left.recoveryScore;
    return riskRank[right.risk] - riskRank[left.risk] || right.balance - left.balance;
  });
}

export function calculateMetrics(accounts: Account[]): Metrics {
  return {
    totalBalance: accounts.reduce((sum, a) => sum + a.balance, 0),
    expectedRecovery: accounts.reduce((sum, a) => sum + a.balance * a.recoveryLikelihood, 0),
    reviewCount: accounts.filter((a) =>
      ["Needs review", "Escalation hold", "Payment plan"].includes(a.status)
    ).length,
    highRiskCount: accounts.filter((a) => ["High", "Critical"].includes(a.risk)).length
  };
}

export function approveAccount(accounts: Account[], accountId: string): Account[] {
  return accounts.map((account) =>
    account.id === accountId
      ? { ...account, approvedAction: true, status: "Approved" as const }
      : account
  );
}

export function undoApproval(accounts: Account[], accountId: string): Account[] {
  return accounts.map((account) =>
    account.id === accountId
      ? {
          ...account,
          approvedAction: false,
          status: account.previousStatus ?? account.originalStatus ?? "Needs review"
        }
      : account
  );
}

export function seedAccountState(accounts: Account[]): Account[] {
  return accounts.map((account) => ({
    ...account,
    originalStatus: account.status,
    previousStatus: account.status,
    approvedAction: false
  }));
}

export function runDemoBatch(accounts: Account[]): Account[] {
  return accounts.map((account) => {
    if (account.id === "AC-1140") {
      return {
        ...account,
        previousStatus: account.status,
        status: "Ready to send" as const,
        recoveryScore: Math.min(100, account.recoveryScore + 4),
        recoveryLikelihood: Math.min(0.95, account.recoveryLikelihood + 0.04),
        reason: "Low-risk reminder auto-prepared"
      };
    }
    if (account.id === "AC-1088") {
      return {
        ...account,
        previousStatus: account.status,
        status: "Needs review" as const,
        recoveryScore: Math.max(0, account.recoveryScore - 6),
        recoveryLikelihood: Math.max(0.1, account.recoveryLikelihood - 0.06),
        reason: "Dispute requires evidence before call"
      };
    }
    if (account.id === "AC-1214") {
      return {
        ...account,
        previousStatus: account.status,
        status: "Payment plan" as const,
        recoveryScore: Math.min(100, account.recoveryScore + 7),
        recoveryLikelihood: Math.min(0.95, account.recoveryLikelihood + 0.07),
        proposedPlan: "40% Friday, 30% in 14 days, 30% in 30 days"
      };
    }
    return account;
  });
}
