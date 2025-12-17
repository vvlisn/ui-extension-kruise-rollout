import { STATE, NAME as NAME_COL, AGE } from '@shell/config/table-headers';
import type { HeaderOptions } from '@shell/core/types';

export const ROLLOUT_HEADERS: HeaderOptions[] = [
  STATE,
  NAME_COL,
  {
    name:     'phase',
    labelKey: 'kruiseRollout.tableHeaders.status',
    value:    'status.phase',
    getValue: (row: any) => row.status?.phase ?? '-',
  },
  {
    name:  'step',
    labelKey: 'kruiseRollout.tableHeaders.canaryStep',
    value: 'status.currentStepIndex',
    getValue: (row: any) => row.status?.currentStepIndex ?? row.status?.canaryStatus?.currentStepIndex ?? '-',
  },
  {
    name:     'canaryState',
    labelKey: 'kruiseRollout.tableHeaders.canaryState',
    value:    'status.canaryStatus.currentStepState',
    getValue: (row: any) => row.status?.canaryStatus?.currentStepState ?? '-',
  },
  {
    name:     'message',
    labelKey: 'kruiseRollout.tableHeaders.message',
    value:    'status.message',
    getValue: (row: any) => row.status?.message ?? '-',
  },
  AGE,
];

export const BATCH_RELEASE_HEADERS: HeaderOptions[] = [
  STATE,
  NAME_COL,
  {
    name:     'workloadKind',
    labelKey: 'kruiseRollout.tableHeaders.kind',
    value:    'spec.targetReference.workloadRef.kind',
    getValue: (row: any) => row.spec?.targetReference?.workloadRef?.kind ?? '-',
  },
  {
    name:     'phase',
    labelKey: 'kruiseRollout.tableHeaders.phase',
    value:    'status.phase',
    getValue: (row: any) => row.status?.phase ?? '-',
  },
  {
    name:     'currentBatch',
    labelKey: 'kruiseRollout.tableHeaders.batch',
    value:    'status.canaryStatus.currentBatch',
    getValue: (row: any) => row.status?.canaryStatus?.currentBatch ?? '-',
  },
  {
    name:     'batchState',
    labelKey: 'kruiseRollout.tableHeaders.batchState',
    value:    'status.canaryStatus.currentBatchState',
    getValue: (row: any) => row.status?.canaryStatus?.currentBatchState ?? '-',
  },
  AGE,
];
