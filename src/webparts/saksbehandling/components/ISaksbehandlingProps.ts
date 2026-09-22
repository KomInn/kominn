import type { CaseWorkerStatus } from '../../../shared/models';

export interface ISaksbehandlingProps {
  /** Saksbehandlerstatuser som vises når siden åpnes. */
  defaultStatuses: CaseWorkerStatus[];
  /** Maks antall forslag som hentes. */
  maxItems: number;
}
