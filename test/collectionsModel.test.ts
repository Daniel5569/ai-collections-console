import assert from "node:assert/strict";
import test from "node:test";
import {
  approveAccount,
  calculateMetrics,
  filterAccounts,
  runDemoBatch,
  seedAccountState,
  undoApproval
} from "../lib/collectionsModel.ts";
import type { Account } from "../lib/types.ts";

const accounts: Account[] = seedAccountState([
  {
    id: "AC-1",
    company: "Apex",
    contact: "Controller",
    balance: 1000,
    daysPastDue: 10,
    status: "Ready to send",
    risk: "Low",
    recoveryScore: 80,
    recoveryLikelihood: 0.8,
    reason: "First reminder",
    owner: "AI agent"
  },
  {
    id: "AC-1088",
    company: "Cascade Freight",
    contact: "Controller",
    balance: 31000,
    daysPastDue: 63,
    status: "Ready to send",
    risk: "High",
    recoveryScore: 58,
    recoveryLikelihood: 0.47,
    reason: "Dispute mentioned",
    owner: "AI agent"
  },
  {
    id: "AC-1214",
    company: "Atlas DevWorks",
    contact: "Founder",
    balance: 11950,
    daysPastDue: 35,
    status: "Payment plan",
    risk: "Medium",
    recoveryScore: 69,
    recoveryLikelihood: 0.61,
    reason: "Split requested",
    owner: "AI agent"
  }
]);

test("filters by status and search text", () => {
  const result = filterAccounts(accounts, { filter: "Ready to send", search: "cascade", sort: "balance" });

  assert.equal(result.length, 1);
  assert.equal(result[0].id, "AC-1088");
});

test("sorts by risk before balance by default", () => {
  const result = filterAccounts(accounts);

  assert.equal(result[0].risk, "High");
});

test("approval and undo update the account state", () => {
  const approved = approveAccount(accounts, "AC-1");

  assert.equal(approved.find((a) => a.id === "AC-1")?.status, "Approved");
  assert.equal(filterAccounts(approved, { filter: "Approved" }).length, 1);

  const undone = undoApproval(approved, "AC-1");
  assert.equal(undone.find((a) => a.id === "AC-1")?.status, "Ready to send");
});

test("demo batch changes routing and metrics", () => {
  const before = calculateMetrics(accounts);
  const afterAccounts = runDemoBatch(accounts);
  const after = calculateMetrics(afterAccounts);

  assert.equal(afterAccounts.find((a) => a.id === "AC-1088")?.status, "Needs review");
  assert.notEqual(after.expectedRecovery, before.expectedRecovery);
});
