"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Filter,
  Gauge,
  ListChecks,
  MessageSquareText,
  Play,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { guardrails, initialAuditLog } from "@/lib/demoData";
import {
  approveAccount,
  calculateMetrics,
  filterAccounts,
  runDemoBatch,
  seedAccountState,
  undoApproval
} from "@/lib/collectionsModel";
import type { Account, AuditEntry, FilterOption, SortOption } from "@/lib/types";

const filters: FilterOption[] = [
  "All",
  "Needs review",
  "Ready to send",
  "Payment plan",
  "Escalation hold",
  "Approved"
];

const sortOptions: [SortOption, string][] = [
  ["risk", "Risk"],
  ["balance", "Balance"],
  ["age", "Age"],
  ["recovery", "Recovery"]
];

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

function riskClass(risk: Account["risk"]): string {
  const map: Record<Account["risk"], string> = {
    Low: "riskLow",
    Medium: "riskMedium",
    High: "riskHigh",
    Critical: "riskCritical"
  };
  return map[risk];
}

function statusClass(status: string): string {
  return status.toLowerCase().replaceAll(" ", "");
}

export default function CollectionsConsole() {
  const [accountState, setAccountState] = useState<Account[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [filter, setFilter] = useState<FilterOption>("All");
  const [search, setSearch] = useState<string>("");
  const [sort, setSort] = useState<SortOption>("risk");
  const [auditLog, setAuditLog] = useState<AuditEntry[]>(initialAuditLog);
  const [isRunningBatch, setIsRunningBatch] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;
    fetch("/api/accounts")
      .then((res) => res.json() as Promise<Account[]>)
      .then((data) => {
        if (!active) return;
        const seeded = seedAccountState(data);
        setAccountState(seeded);
        setSelectedId(seeded[0]?.id ?? "");
      })
      .catch(console.error)
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const visibleAccounts = useMemo(
    () => filterAccounts(accountState, { filter, search, sort }),
    [accountState, filter, search, sort]
  );

  if (isLoading) {
    return (
      <main className="appShell">
        <p className="loadingState">Loading account queue…</p>
      </main>
    );
  }

  const selected = accountState.find((a) => a.id === selectedId) ?? accountState[0];

  if (!selected) {
    return (
      <main className="appShell">
        <p className="loadingState">No accounts available.</p>
      </main>
    );
  }

  const { totalBalance, expectedRecovery, reviewCount, highRiskCount } =
    calculateMetrics(accountState);

  function approveAction() {
    if (selected.approvedAction) return;
    setAccountState((current) => approveAccount(current, selected.id));
    setAuditLog([
      {
        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        account: selected.id,
        action: selected.nextStep ?? "Action approved",
        actor: "Human reviewer",
        outcome: "Approved in demo queue"
      },
      ...auditLog
    ]);
  }

  function undoApprovedAction() {
    setAccountState((current) => undoApproval(current, selected.id));
    setAuditLog([
      {
        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        account: selected.id,
        action: selected.nextStep ?? "Approval undone",
        actor: "Human reviewer",
        outcome: "Approval undone in demo queue"
      },
      ...auditLog
    ]);
  }

  function simulateAgentRun() {
    setIsRunningBatch(true);
    setAccountState((current) => runDemoBatch(current));
    window.setTimeout(() => setIsRunningBatch(false), 520);
    setAuditLog([
      {
        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        account: "Batch run",
        action: "AI reviewed overdue queue",
        actor: "Workflow simulator",
        outcome: "Scores updated, dispute routed, low-touch reminder prepared"
      },
      ...auditLog
    ]);
  }

  return (
    <main className="appShell">
      <section className="topbar" aria-label="Workspace summary">
        <div>
          <p className="eyebrow">AgentCollect-style demo</p>
          <h1>AI Collections &amp; Back-office Automation Console</h1>
          <p className="subtitle">
            A human-reviewed workflow for overdue B2B accounts: AI drafts, reason codes, approval
            queue and audit trail.
          </p>
        </div>
        <button
          className="primaryButton"
          onClick={simulateAgentRun}
          disabled={isRunningBatch}
          type="button"
        >
          <Play size={18} aria-hidden="true" />
          {isRunningBatch ? "Scoring queue" : "Run demo batch"}
        </button>
      </section>

      <section className="metricsGrid" aria-label="Pipeline metrics">
        <MetricCard icon={<Gauge />} label="Recoverable balance" value={money.format(totalBalance)} detail="Fake AR queue" />
        <MetricCard icon={<Sparkles />} label="Forecast recovery" value={money.format(expectedRecovery)} detail="Based on demo scores" />
        <MetricCard icon={<ListChecks />} label="Human review" value={reviewCount} detail="Needs judgment before send" />
        <MetricCard icon={<AlertTriangle />} label="High-risk accounts" value={highRiskCount} detail="Dispute or escalation risk" />
      </section>

      <section className="workArea">
        <div className="queuePanel">
          <div className="panelHeader">
            <div>
              <p className="eyebrow">Queue</p>
              <h2>Overdue accounts</h2>
            </div>
            <Filter size={18} aria-hidden="true" />
          </div>

          <div className="filterTabs" role="tablist" aria-label="Account status filters">
            {filters.map((item) => (
              <button
                key={item}
                className={filter === item ? "activeTab" : ""}
                onClick={() => {
                  setFilter(item);
                  const next = filterAccounts(accountState, { filter: item, search, sort });
                  if (next.length > 0) setSelectedId(next[0].id);
                }}
                aria-selected={filter === item}
                role="tab"
                type="button"
              >
                {item}
              </button>
            ))}
          </div>

          <div className="queueTools" aria-label="Queue search and sort controls">
            <label>
              <span>Search</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Company, owner, reason"
              />
            </label>
            <label>
              <span>Sort</span>
              <select value={sort} onChange={(e) => setSort(e.target.value as SortOption)}>
                {sortOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="accountList">
            {visibleAccounts.map((account) => (
              <button
                key={account.id}
                className={selected.id === account.id ? "accountRow selected" : "accountRow"}
                onClick={() => setSelectedId(account.id)}
                aria-current={selected.id === account.id ? "true" : undefined}
                type="button"
              >
                <span>
                  <strong>{account.company}</strong>
                  <small>
                    {account.id} · {account.daysPastDue} days past due
                  </small>
                </span>
                <span className="rowRight">
                  <b>{money.format(account.balance)}</b>
                  <em className={`statusPill ${statusClass(account.approvedAction ? "Approved" : account.status)}`}>
                    {account.approvedAction ? "Approved" : account.status}
                  </em>
                </span>
              </button>
            ))}
            {visibleAccounts.length === 0 && (
              <p className="emptyState">No accounts match this queue view.</p>
            )}
          </div>
        </div>

        <div className="detailPanel">
          <div className="panelHeader">
            <div>
              <p className="eyebrow">Selected account</p>
              <h2>{selected.company}</h2>
            </div>
            <span className={`riskPill ${riskClass(selected.risk)}`}>{selected.risk} risk</span>
          </div>

          <div className="detailGrid">
            <InfoTile label="Balance" value={money.format(selected.balance)} />
            <InfoTile label="Age" value={`${selected.daysPastDue} days`} />
            <InfoTile label="Recovery score" value={`${selected.recoveryScore}/100`} />
            <InfoTile label="Channel" value={selected.channel ?? "—"} />
            <InfoTile label="Owner" value={selected.owner} />
          </div>

          <div className="reasonBox">
            <div className="reasonHeader">
              <Sparkles size={18} aria-hidden="true" />
              <strong>AI recommendation</strong>
            </div>
            <p>{selected.suggestedAction ?? "—"}</p>
            <small>Reason code: {selected.reason}</small>
          </div>

          <div className="draftBox">
            <div className="reasonHeader">
              <MessageSquareText size={18} aria-hidden="true" />
              <strong>Draft next action</strong>
            </div>
            <p>{selected.draft ?? "—"}</p>
          </div>

          <div className="impactBox">
            <div>
              <span>Estimated recovery</span>
              <strong>{money.format(selected.balance * selected.recoveryLikelihood)}</strong>
            </div>
            <div>
              <span>Payment path</span>
              <strong>{selected.proposedPlan ?? "—"}</strong>
            </div>
          </div>

          <div className="actionRow">
            <button
              className="primaryButton"
              onClick={approveAction}
              disabled={selected.approvedAction}
              type="button"
            >
              <CheckCircle2 size={18} aria-hidden="true" />
              {selected.approvedAction ? "Action approved" : "Approve action"}
            </button>
            {selected.approvedAction && (
              <button className="secondaryButton" onClick={undoApprovedAction} type="button">
                Undo approval
              </button>
            )}
            <button className="secondaryButton" onClick={simulateAgentRun} type="button">
              <ArrowRight size={18} aria-hidden="true" />
              Re-score queue
            </button>
          </div>
        </div>

        <aside className="sidePanel">
          <section>
            <div className="panelHeader compact">
              <div>
                <p className="eyebrow">Controls</p>
                <h2>Guardrails</h2>
              </div>
              <ShieldCheck size={18} aria-hidden="true" />
            </div>
            <ul className="guardrailList">
              {guardrails.map((item) => (
                <li key={item}>
                  <FileCheck2 size={16} aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <div className="panelHeader compact">
              <div>
                <p className="eyebrow">Audit</p>
                <h2>Decision log</h2>
              </div>
              <Clock3 size={18} aria-hidden="true" />
            </div>
            <div className="auditList">
              {auditLog.slice(0, 7).map((item, index) => (
                <article key={`${item.time}-${item.account}-${index}`}>
                  <span>{item.time}</span>
                  <strong>{item.account}</strong>
                  <p>{item.action}</p>
                  <small>
                    {item.actor} · {item.outcome}
                  </small>
                </article>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  detail: string;
}

function MetricCard({ icon, label, value, detail }: MetricCardProps) {
  return (
    <article className="metricCard">
      <div className="metricIcon" aria-hidden="true">
        {icon}
      </div>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

interface InfoTileProps {
  label: string;
  value: string;
}

function InfoTile({ label, value }: InfoTileProps) {
  return (
    <article className="infoTile">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
