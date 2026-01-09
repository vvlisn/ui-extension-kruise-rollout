<script setup>
import {
  ref, reactive, computed, onMounted, getCurrentInstance
} from 'vue';
import { useStore } from 'vuex';

import SortableTable from '@shell/components/SortableTable';

const store = useStore();
const t = store.getters['i18n/t'];
let route = null;

// The workload whose detail page we are currently on
const workload = ref(null);

// Related Kruise Rollout & BatchRelease objects
const rollouts = ref([]);
const batchReleases = ref([]);

const fetchState = reactive({ pending: true });

// Simple table headers similar to Rancher workload tabs
// Use value functions so rows can remain real Rancher models and keep their
// built-in actions (needed for the row action menu).
const headers = [
  {
    name:  'type',
    label: t('kruiseRollout.workloadTab.headers.type'),
    value: (row) => (row.type === 'rollouts.kruise.io.rollout'
      ? t('kruiseRollout.common.rollout')
      : t('kruiseRollout.common.batchRelease')),
  },
  {
    name:  'name',
    label: t('kruiseRollout.workloadTab.headers.name'),
    value: 'metadata.name',
  },
  {
    name:  'namespace',
    label: t('kruiseRollout.workloadTab.headers.namespace'),
    value: 'metadata.namespace',
  },
  {
    name:  'phase',
    label: t('kruiseRollout.workloadTab.headers.phase'),
    value: 'status.phase',
  },
  {
    name:  'progress',
    label: t('kruiseRollout.workloadTab.headers.progress'),
    value: (row) => (row.type === 'rollouts.kruise.io.rollout'
      ? (row.status?.currentStepIndex ?? row.status?.canaryStatus?.currentStepIndex ?? '-')
      : (row.status?.canaryStatus?.currentBatch ?? '-')),
  },
  {
    name:  'message',
    label: t('kruiseRollout.workloadTab.headers.message'),
    value: 'status.message',
  },
];

// Merge Rollout & BatchRelease rows without cloning so the default Rancher
// row action menu (Show Configuration, Edit YAML, Clone, etc.) continues to
// work on the original model instances.
const rows = computed(() => [
  ...(rollouts.value || []),
  ...(batchReleases.value || []),
]);

function determineWorkload() {
  if (route?.params?.resource && route?.params?.id) {
    const id = route?.params.namespace ? `${ route.params.namespace }/${ route.params.id }` : route.params.id;

    workload.value = store.getters['cluster/byId'](route.params.resource, id);
  }
}

async function fetchRelatedResources() {
  fetchState.pending = true;

  const target = workload.value;

  if (!target) {
    rollouts.value = [];
    batchReleases.value = [];
    fetchState.pending = false;

    return;
  }

  const rolloutType = 'rollouts.kruise.io.rollout';
  const batchType = 'rollouts.kruise.io.batchrelease';

  const rolloutSchema = store.getters['cluster/schemaFor'](rolloutType);
  const batchSchema = store.getters['cluster/schemaFor'](batchType);

  const kind = target.kind;
  const name = target.metadata?.name;
  const namespace = target.metadata?.namespace;

  const promises = [];

  if (rolloutSchema) {
    promises.push((async() => {
      let all = store.getters['cluster/all'](rolloutType) || [];

      if (!all.length) {
        all = await store.dispatch('cluster/findAll', { type: rolloutType }, { root: true });
      }

      rollouts.value = (all || []).filter((r) => {
        const spec = r.spec || {};
        const ref = spec.workloadRef || spec.objectRef?.workloadRef;

        if (!ref) {
          return false;
        }

        return ref.kind === kind && ref.name === name && r.metadata?.namespace === namespace;
      });
    })());
  }

  if (batchSchema) {
    promises.push((async() => {
      let all = store.getters['cluster/all'](batchType) || [];

      if (!all.length) {
        all = await store.dispatch('cluster/findAll', { type: batchType }, { root: true });
      }

      batchReleases.value = (all || []).filter((b) => {
        const ref = b.spec?.targetReference?.workloadRef;

        if (!ref) {
          return false;
        }

        return ref.kind === kind && ref.name === name && b.metadata?.namespace === namespace;
      });
    })());
  }

  await Promise.all(promises);

  fetchState.pending = false;
}

function getDetailLink(row) {
  const ns = row.metadata?.namespace;
  const id = row.metadata?.name;
  const type = row.type;

  if (ns) {
    return {
      name:   'c-cluster-product-resource-namespace-id',
      params: {
        resource: type,
        namespace: ns,
        id,
      },
    };
  }

  return {
    name:   'c-cluster-product-resource-id',
    params: {
      resource: type,
      id,
    },
  };
}

onMounted(async() => {
  // Access current route via the component instance, like kubewarden-ui does
  if (!route) {
    const instance = getCurrentInstance();

    if (instance?.proxy?.$route) {
      route = instance.proxy.$route;
    } else {
      fetchState.pending = false;

      return;
    }
  }

  determineWorkload();
  await fetchRelatedResources();
});
</script>

<template>
  <div v-if="fetchState.pending" class="kruise-rollout-tab__loading">
    <i class="icon icon-lg icon-spinner icon-spin m-20" />
  </div>
  <div v-else class="kruise-rollout-tab__container">
    <SortableTable
      :rows="rows"
      :headers="headers"
      :table-actions="false"
      :row-actions="true"
      key-field="id"
      :paging="true"
      :rows-per-page="25"
    >
      <template #col:name="{ row }">
        <td>
          <router-link :to="getDetailLink(row)">
            {{ row.metadata?.name }}
          </router-link>
        </td>
      </template>
    </SortableTable>
  </div>
</template>

<style scoped>
.kruise-rollout-tab__loading {
  display: flex;
  justify-content: center;
}

.kruise-rollout-tab__container {
  padding-top: 10px;
}

.text-muted {
  color: var(--text-muted);
}
</style>
