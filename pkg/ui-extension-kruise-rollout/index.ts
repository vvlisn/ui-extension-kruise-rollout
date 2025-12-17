import { importTypes } from '@rancher/auto-import';
import { TabLocation } from '@shell/core/types';
import { WORKLOAD_TYPES } from '@shell/config/types';

// Init the package for the Kruise Rollout extension.
export default function($plugin: any): void {
  // Auto-import model, list, detail, edit from the folders
  importTypes($plugin);

  // Provide plugin metadata from package.json
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  $plugin.metadata = require('./package.json');

  // Register Kruise Rollout as its own product so it appears as a
  // top-level entry in the Explorer navigation.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  $plugin.addProduct(require('./config/kruise-rollout'));

   // Add a Kruise Rollout tab to standard Rancher workload detail pages.
   $plugin.addTab(
     TabLocation.RESOURCE_DETAIL,
     {
       resource: [
         WORKLOAD_TYPES.DEPLOYMENT,
         WORKLOAD_TYPES.STATEFUL_SET,
         WORKLOAD_TYPES.DAEMON_SET,
         WORKLOAD_TYPES.JOB,
         WORKLOAD_TYPES.CRON_JOB,
       ],
     },
     {
       name:       'kruise-rollout-tab',
       labelKey:   'kruiseRollout.tabs.workloadRollout',
       weight:     -5,
       showHeader: false,
       component:  () => import('./components/WorkloadRolloutTab.vue'),
     },
   );
}
