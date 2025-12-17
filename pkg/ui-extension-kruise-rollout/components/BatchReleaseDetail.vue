<template>
  <section class="kruise-batchrelease-detail resource-detail">
    <ResourceTabs
      :value="value"
      :mode="mode"
      :need-related="true"
      :need-events="true"
      :need-conditions="true"
      :default-tab="'overview'"
      @update:value="$emit('update:value', $event)"
    >
      <Tab name="overview" :label="t('kruiseRollout.detail.common.overview')" :weight="1">
        <SortableTable
          :rows="tableRows"
          :headers="headers"
          :table-actions="false"
          :row-actions="false"
          key-field="id"
          :paging="false"
        />
      </Tab>
    </ResourceTabs>
  </section>
</template>

<script>
import { defineComponent } from 'vue';
import { mapGetters } from 'vuex';
import ResourceTabs from './ResourceTabsWrapper.vue';
import Tab from '@shell/components/Tabbed/Tab';
import SortableTable from '@shell/components/SortableTable';

export default defineComponent({
  name: 'KruiseBatchReleaseDetail',

  components: {
    ResourceTabs,
    Tab,
    SortableTable,
  },

  computed: {
    ...mapGetters({ t: 'i18n/t' }),

    batch() {
      return this.value;
    },

    tableRows() {
      return this.batch ? [this.batch] : [];
    },

    headers() {
      return [
        {
          name:  'type',
          label: this.t('kruiseRollout.detail.batchRelease.type'),
          value: () => this.t('kruiseRollout.common.batchRelease'),
        },
        {
          name:  'name',
          label: this.t('kruiseRollout.detail.batchRelease.name'),
          value: 'metadata.name',
        },
        {
          name:  'workload',
          label: this.t('kruiseRollout.detail.batchRelease.workload'),
          value: (row) => {
            const ref = row.spec?.targetReference?.workloadRef;

            if (!ref) {
              return '-';
            }

            const kind = ref.kind || '';
            const name = ref.name || '';

            if (kind && name) {
              return `${ kind }/${ name }`;
            }

            return name || kind || '-';
          },
        },
        {
          name:  'namespace',
          label: this.t('kruiseRollout.detail.batchRelease.namespace'),
          value: 'metadata.namespace',
        },
        {
          name:  'phase',
          label: this.t('kruiseRollout.detail.batchRelease.phase'),
          value: 'status.phase',
        },
        {
          name:  'progress',
          label: this.t('kruiseRollout.detail.batchRelease.progress'),
          value: (row) => (row.status?.canaryStatus?.currentBatch ?? '-'),
        },
        {
          name:  'message',
          label: this.t('kruiseRollout.detail.batchRelease.message'),
          value: 'status.message',
        },
      ];
    },
  },

  props: {
    // Rancher passes the resource as `value` into detail views
    value: {
      type: Object,
      required: true,
    },
    mode: {
      type: String,
      default: 'view',
    },
  },

  emits: ['update:value'],

  provide() {
    return { 'update-count': () => 0 };
  },
});
</script>

<style scoped>
.kruise-batchrelease-detail {
  padding: 16px 24px;
}
</style>
