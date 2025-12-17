<script>
// Simple BatchRelease edit form for a few key fields. More detailed
// configuration (per-batch replica counts, finalizing policy, etc.) can
// still be adjusted via "Edit as YAML".
//
// Note: the `value` prop is a mutable Rancher model object. Mutating
// it in-place is the normal pattern when used inside <CruResource>.

import Tabbed from '@shell/components/Tabbed';
import Tab from '@shell/components/Tabbed/Tab';
import { mapGetters } from 'vuex';

export default {
  name: 'KruiseBatchReleaseConfig',

  components: {
    Tabbed,
    Tab,
  },

  props: {
    value: {
      type:     Object,
      required: true,
    },

    mode: {
      type:    String,
      default: 'edit',
    },
  },

  computed: {
    ...mapGetters({ t: 'i18n/t' }),
    // Backing spec for the BatchRelease resource. Ensure `spec` always
    // exists so other computed properties can freely mutate it.
    spec() {
      this.value.spec = this.value.spec || {};

      return this.value.spec;
    },

    releasePlan() {
      this.spec.releasePlan = this.spec.releasePlan || {};

      return this.spec.releasePlan;
    },

    targetReference() {
      this.spec.targetReference = this.spec.targetReference || {};
      this.spec.targetReference.workloadRef = this.spec.targetReference.workloadRef || {
        apiVersion: '',
        kind:       '',
        name:       '',
      };

      return this.spec.targetReference.workloadRef;
    },

    batchPartition: {
      get() {
        return this.releasePlan.batchPartition ?? '';
      },

      set(neu) {
        const parsed = neu === '' ? null : Number(neu);

        this.releasePlan.batchPartition = Number.isNaN(parsed) ? undefined : parsed;
      },
    },

    rollingStyle: {
      get() {
        return this.releasePlan.rollingStyle || '';
      },

      set(neu) {
        this.releasePlan.rollingStyle = neu || undefined;
      },
    },
  },
};
</script>

<template>
  <div class="kruise-batchrelease-config">
    <Tabbed
      :side-tabs="true"
      :use-hash="false"
    >
      <Tab
        name="target-workload"
        :label="t('kruiseRollout.config.batchRelease.tabs.targetWorkload')"
        :weight="99"
      >
        <div class="section">
          <div class="form-row">
            <label class="form-label" for="kruise-batchrelease-workload-apiversion">{{ t('kruiseRollout.config.batchRelease.workloadRef.apiVersion') }}</label>
            <input
              id="kruise-batchrelease-workload-apiversion"
              v-model="targetReference.apiVersion"
              type="text"
              class="input"
            >
          </div>

          <div class="form-row">
            <label class="form-label" for="kruise-batchrelease-workload-kind">{{ t('kruiseRollout.config.batchRelease.workloadRef.kind') }}</label>
            <input
              id="kruise-batchrelease-workload-kind"
              v-model="targetReference.kind"
              type="text"
              class="input"
            >
          </div>

          <div class="form-row">
            <label class="form-label" for="kruise-batchrelease-workload-name">{{ t('kruiseRollout.config.batchRelease.workloadRef.name') }}</label>
            <input
              id="kruise-batchrelease-workload-name"
              v-model="targetReference.name"
              type="text"
              class="input"
            >
          </div>
        </div>
      </Tab>

      <Tab
        name="release-plan"
        :label="t('kruiseRollout.config.batchRelease.tabs.releasePlan')"
        :weight="98"
      >
        <div class="section">
          <div class="form-row">
            <label class="form-label" for="kruise-batchrelease-batch-partition">{{ t('kruiseRollout.config.batchRelease.releasePlan.batchPartition') }}</label>
            <input
              id="kruise-batchrelease-batch-partition"
              v-model="batchPartition"
              type="number"
              min="0"
              class="input"
            >
          </div>

          <div class="form-row">
            <label class="form-label" for="kruise-batchrelease-rolling-style">{{ t('kruiseRollout.config.batchRelease.releasePlan.rollingStyle') }}</label>
            <select
              id="kruise-batchrelease-rolling-style"
              v-model="rollingStyle"
              class="input"
            >
              <option value="">{{ t('kruiseRollout.config.batchRelease.releasePlan.rollingStyleOptions.default') }}</option>
              <option value="Canary">{{ t('kruiseRollout.config.batchRelease.releasePlan.rollingStyleOptions.canary') }}</option>
              <option value="Partition">{{ t('kruiseRollout.config.batchRelease.releasePlan.rollingStyleOptions.partition') }}</option>
              <option value="BlueGreen">{{ t('kruiseRollout.config.batchRelease.releasePlan.rollingStyleOptions.blueGreen') }}</option>
            </select>
          </div>

          <p class="hint">
            {{ t('kruiseRollout.config.batchRelease.releasePlan.hint') }}
          </p>
        </div>
      </Tab>
    </Tabbed>
  </div>
</template>

<style scoped>
.kruise-batchrelease-config {
  max-width: 720px;
}

.section {
  margin-bottom: 20px;
}

.section-title {
  margin: 0 0 8px;
  font-size: 16px;
}

.form-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.form-label {
  width: 140px;
  font-weight: 600;
  font-size: 13px;
}

.input {
  flex: 1;
  min-width: 0;
}

.hint {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--text-muted);
}
</style>
