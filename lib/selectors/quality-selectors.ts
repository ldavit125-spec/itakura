import type {
  InspectionQueueItem,
  IncomingInspection,
  ProcessInspection,
  FinishedGoodsInspection,
  Nonconformity,
  CorrectiveAction,
} from "@/types/quality";
import { filterByDateRange } from "./business-date";

export function getPendingInspections(queue: InspectionQueueItem[]): InspectionQueueItem[] {
  return queue.filter(
    (q) => q.status === "REQUESTED" || q.status === "ASSIGNED" || q.status === "IN_PROGRESS"
  );
}

export function calculateInspectionPassRate(passedCount: number, completedTotalCount: number): number {
  if (!completedTotalCount || completedTotalCount <= 0) return 0;
  return Number(((passedCount / completedTotalCount) * 100).toFixed(1));
}

export function aggregateInspectionResults(
  incoming: IncomingInspection[],
  processList: ProcessInspection[],
  finished: FinishedGoodsInspection[],
  startDate?: string,
  endDate?: string
): {
  totalCount: number;
  completedCount: number;
  passedCount: number;
  conditionalPassCount: number;
  holdCount: number;
  failedCount: number;
  passRate: number;
} {
  const fIQC = filterByDateRange(incoming, (i) => i.inspectionDate, startDate, endDate);
  const fPQC = filterByDateRange(processList, (p) => p.inspectionDate, startDate, endDate);
  const fFQC = filterByDateRange(finished, (f) => f.inspectionDate, startDate, endDate);

  const allList = [...fIQC, ...fPQC, ...fFQC];
  const totalCount = allList.length;
  const completedList = allList.filter((i) => i.status === "COMPLETED");
  const completedCount = completedList.length;

  const passedCount = completedList.filter((i) => i.judgment === "PASSED").length;
  const conditionalPassCount = completedList.filter((i) => i.judgment === "CONDITIONAL_PASS").length;
  const holdCount = completedList.filter((i) => i.judgment === "HOLD").length;
  const failedCount = completedList.filter((i) => i.judgment === "FAILED").length;

  const passRate = calculateInspectionPassRate(passedCount + conditionalPassCount, completedCount);

  return {
    totalCount,
    completedCount,
    passedCount,
    conditionalPassCount,
    holdCount,
    failedCount,
    passRate,
  };
}

export function getOpenNonconformities(
  nonconformities: Nonconformity[],
  startDate?: string,
  endDate?: string
): Nonconformity[] {
  const filtered = filterByDateRange(nonconformities, (n) => n.occurredDate, startDate, endDate);
  return filtered.filter((n) => n.ncStatus !== "CLOSED");
}

export function getIncompleteCorrectiveActions(
  actions: CorrectiveAction[],
  startDate?: string,
  endDate?: string
): CorrectiveAction[] {
  const filtered = filterByDateRange(actions, (c) => c.requestDate, startDate, endDate);
  return filtered.filter((c) => c.caStatus !== "CLOSED" && c.caStatus !== "VERIFIED");
}
