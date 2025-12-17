<template>
  <section class="kruise-rollout-detail resource-detail">
    <ResourceTabs
      :value="value"
      :mode="mode"
      :need-related="false"
      :need-events="false"
      :need-conditions="false"
      :default-tab="'overview'"
      @update:value="$emit('update:value', $event)"
    >
      <Tab name="overview" :label="t('kruiseRollout.detail.common.overview')" :weight="1">
        <SortableTable
          :rows="overviewTableRows"
          :headers="overviewHeaders"
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
  name: 'KruiseRolloutDetail',

  components: {
    ResourceTabs,
    Tab,
    SortableTable,
  },

  computed: {
    ...mapGetters({ t: 'i18n/t' }),

    rollout() {
      return this.value;
    },

    overviewTableRows() {
      return this.rollout ? [this.rollout] : [];
    },

    overviewHeaders() {
      return [
        {
          name:  'type',
          label: this.t('kruiseRollout.detail.rollout.type'),
          value: () => this.t('kruiseRollout.common.rollout'),
        },
        {
          name:  'name',
          label: this.t('kruiseRollout.detail.rollout.name'),
          value: 'metadata.name',
        },
        {
          name:  'workload',
          label: this.t('kruiseRollout.detail.rollout.workload'),
          value: (row) => {
            const spec = row.spec || {};
            const ref = spec.workloadRef || (spec.objectRef && spec.objectRef.workloadRef);

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
          label: this.t('kruiseRollout.detail.rollout.namespace'),
          value: 'metadata.namespace',
        },
        {
          name:  'phase',
          label: this.t('kruiseRollout.detail.rollout.phase'),
          value: 'status.phase',
        },
        {
          name:  'message',
          label: this.t('kruiseRollout.detail.rollout.message'),
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
      type:    String,
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
.kruise-rollout-detail {
  padding: 16px 24px;
}

</style>
