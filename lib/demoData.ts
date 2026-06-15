import type { Account, AuditEntry } from "./types";

export const accounts: Account[] = [
  {
    id: "AC-1027",
    company: "Northstar Components",
    contact: "AP Manager",
    balance: 18420,
    daysPastDue: 47,
    status: "Needs review",
    channel: "Email + call",
    risk: "Medium",
    recoveryScore: 72,
    recoveryLikelihood: 0.64,
    proposedPlan: "50% now, 50% in 14 days",
    reason: "No payment owner confirmed",
    suggestedAction: "Ask for payment owner, attach statement, offer 2-step payment plan",
    draft:
      "Hi Northstar team, I am following up on invoice INV-1027 for $18,420, now 47 days past due. Could you confirm the right AP owner and whether a two-step payment plan would help close this this week?",
    nextStep: "Human approve first reminder",
    owner: "AI agent 04"
  },
  {
    id: "AC-1088",
    company: "Cascade Freight",
    contact: "Controller",
    balance: 31200,
    daysPastDue: 63,
    status: "Ready to send",
    channel: "Call script",
    risk: "High",
    recoveryScore: 58,
    recoveryLikelihood: 0.47,
    proposedPlan: "Dispute-first call, no plan until evidence is logged",
    reason: "Dispute mentioned in last email",
    suggestedAction: "Call first, confirm dispute category, do not escalate until evidence is logged",
    draft:
      "Call opener: I am calling about invoice INV-1088. I see there may be a dispute, so I want to understand the exact reason before anyone escalates this further.",
    nextStep: "Approve call script",
    owner: "AI agent 11"
  },
  {
    id: "AC-1140",
    company: "BrightOps Labs",
    contact: "Finance Lead",
    balance: 7600,
    daysPastDue: 22,
    status: "Low touch",
    channel: "Email",
    risk: "Low",
    recoveryScore: 84,
    recoveryLikelihood: 0.78,
    proposedPlan: "One-click payment link, no split needed",
    reason: "Likely missed approval",
    suggestedAction: "Send friendly reminder with payment link and statement",
    draft:
      "Hi BrightOps team, quick reminder on invoice INV-1140 for $7,600. Here is the statement and payment link. If anything is blocking approval, reply here and I will route it to the right team.",
    nextStep: "Auto-send eligible",
    owner: "AI agent 02"
  },
  {
    id: "AC-1181",
    company: "Meridian Health Supply",
    contact: "Operations Director",
    balance: 42880,
    daysPastDue: 91,
    status: "Escalation hold",
    channel: "Attorney review",
    risk: "Critical",
    recoveryScore: 41,
    recoveryLikelihood: 0.35,
    proposedPlan: "Human finance approval before attorney packet",
    reason: "Large balance, no response, regulated customer",
    suggestedAction: "Prepare attorney packet, but require finance approval before any demand letter",
    draft:
      "Escalation note: account has no verified response across email and phone. Evidence packet includes invoice, statement, contact attempts and customer notes. Human finance approval required.",
    nextStep: "Finance approval",
    owner: "AI agent 19"
  },
  {
    id: "AC-1214",
    company: "Atlas DevWorks",
    contact: "Founder",
    balance: 11950,
    daysPastDue: 35,
    status: "Payment plan",
    channel: "SMS + email",
    risk: "Medium",
    recoveryScore: 69,
    recoveryLikelihood: 0.61,
    proposedPlan: "40% this week, 60% within 30 days",
    reason: "Customer requested split payment",
    suggestedAction: "Offer documented 40/60 split, ask for first payment date",
    draft:
      "Thanks for the update. We can propose a 40/60 split if the first payment is scheduled this week. Please confirm the first date and preferred payment method.",
    nextStep: "Approve payment plan",
    owner: "AI agent 07"
  },
  {
    id: "AC-1250",
    company: "Harborline Media",
    contact: "Agency Owner",
    balance: 5400,
    daysPastDue: 18,
    status: "Ready to send",
    channel: "Email",
    risk: "Low",
    recoveryScore: 88,
    recoveryLikelihood: 0.82,
    proposedPlan: "Friendly reminder with payment link",
    reason: "First reminder only",
    suggestedAction: "Send under customer brand, keep tone friendly",
    draft:
      "Hi Harborline team, just resurfacing invoice INV-1250 for $5,400. If payment has already been scheduled, thank you; otherwise the payment link is below.",
    nextStep: "Approve reminder",
    owner: "AI agent 01"
  }
];

export const initialAuditLog: AuditEntry[] = [
  {
    time: "09:12",
    account: "AC-1088",
    action: "Dispute reason detected",
    actor: "AI classifier",
    outcome: "Routed to human review"
  },
  {
    time: "09:18",
    account: "AC-1214",
    action: "Payment plan proposed",
    actor: "Human reviewer",
    outcome: "Waiting for approval"
  },
  {
    time: "09:26",
    account: "AC-1140",
    action: "Low-risk reminder prepared",
    actor: "AI agent 02",
    outcome: "Eligible for auto-send"
  }
];

export const guardrails: string[] = [
  "No legal escalation without human approval",
  "Disputes must be categorized before follow-up",
  "Tone stays respectful and under customer brand",
  "Every AI recommendation creates an audit event",
  "No real customer data in this demo"
];
