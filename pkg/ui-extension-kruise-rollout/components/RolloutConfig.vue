<script>
// Simple Rollout edit form, focused on the most commonly used fields.
// More advanced knobs (steps, trafficRoutings, etc.) can be adjusted via
// the standard "Edit as YAML" action provided by CruResource.
//
// Note: the `value` prop is a mutable Rancher model object. Mutating
// it in-place is the normal pattern when used inside <CruResource>.

import Tabbed from '@shell/components/Tabbed';
import Tab from '@shell/components/Tabbed/Tab';
import LabeledSelect from '@shell/components/form/LabeledSelect';
import { SCALABLE_WORKLOAD_TYPES } from '@shell/config/types';
import { mapGetters } from 'vuex';

export default {
  name: 'KruiseRolloutConfig',

  components: {
    Tabbed,
    Tab,
    LabeledSelect,
  },

  // `value` 和 `mode` 由上层 <CruResource> / 编辑页面传入
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
    // Backing spec for the Rollout resource. Ensure `spec` always
    // exists so other computed properties can freely mutate it.
    spec() {
      this.value.spec = this.value.spec || {};

      return this.value.spec;
    },

    // Whether the rollout is disabled
    disabled: {
      get() {
        return !!this.spec.disabled;
      },

      set(neu) {
        this.spec.disabled = !!neu;
      },
    },

    // Rollout ID (simple string field, commonly used to differentiate waves)
    rolloutID: {
      get() {
        return this.spec.rolloutID || '';
      },

      set(neu) {
        this.spec.rolloutID = neu || undefined;
      },
    },

    // Workload reference (supports both .spec.workloadRef and
    // .spec.objectRef.workloadRef). New Rollouts are normalized to use
    // objectRef.workloadRef.
    workloadRef: {
      get() {
        const spec = this.spec;

        // Prefer the nested objectRef.workloadRef structure
        if (spec.objectRef && spec.objectRef.workloadRef) {
          return spec.objectRef.workloadRef;
        }

        if (spec.workloadRef) {
          // Normalize legacy spec.workloadRef into objectRef.workloadRef
          spec.objectRef = spec.objectRef || {};
          spec.objectRef.workloadRef = spec.workloadRef;
          delete spec.workloadRef;

          return spec.objectRef.workloadRef;
        }

        // For new Rollouts, default the target workload reference to a Deployment
        // in the apps/v1 API group. The name will be filled by the selector below.
        const empty = { apiVersion: 'apps/v1', kind: 'Deployment', name: '' };

        spec.objectRef = spec.objectRef || {};
        spec.objectRef.workloadRef = empty;

        return spec.objectRef.workloadRef;
      },

      set(neu) {
        const spec = this.spec;
        spec.objectRef = spec.objectRef || {};
        spec.objectRef.workloadRef = neu;
        // Ensure we don't carry both shapes at once
        if (spec.workloadRef) {
          delete spec.workloadRef;
        }
      },
    },

    // All Deployments in the current namespace that can be targeted by
    // this Rollout. Only the names are exposed so that the Name field
    // can be a dropdown.
    workloadOptions() {
      const ns = this.value && this.value.metadata && this.value.metadata.namespace;
      const options = [];

      Object.values(SCALABLE_WORKLOAD_TYPES || {}).forEach((type) => {
        const all = this.$store.getters['cluster/all'](type) || [];

        all.forEach((wl) => {
          if ((!ns || wl.metadata?.namespace === ns) && wl.kind === 'Deployment') {
            const name = wl.metadata && wl.metadata.name;

            if (name && !options.includes(name)) {
              options.push(name);
            }
          }
        });
      });

      return options;
    },

    // Simple strategy type selector. Details remain editable via YAML.
    strategyType: {
      get() {
        const strategy = this.spec.strategy || {};

        if (strategy.canary) {
          return 'canary';
        }

        if (strategy.blueGreen) {
          return 'blueGreen';
        }

        return 'canary';
      },

      set(neu) {
        const strategy = this.spec.strategy || {};

        if (neu === 'blueGreen') {
          strategy.blueGreen = strategy.blueGreen || {};
          delete strategy.canary;
        } else {
          strategy.canary = strategy.canary || {};
          delete strategy.blueGreen;
        }

        // Direct assignment works in both Vue 2 & Vue 3 (no this.$set needed)
        this.spec.strategy = strategy;
      },
    },

    // Ensure there is a canary strategy object we can safely mutate
    canaryStrategy() {
      const spec = this.spec;

      spec.strategy = spec.strategy || {};
      spec.strategy.canary = spec.strategy.canary || {};

      return spec.strategy.canary;
    },
  },

  methods: {
    addCanaryStep() {
      const canary = this.canaryStrategy;

      if (!Array.isArray(canary.steps)) {
        // Initialize steps array lazily when the first step is added
        canary.steps = [];
      }

      canary.steps.push({ replicas: '' });
    },

    removeCanaryStep(idx) {
      const canary = this.canaryStrategy;

      if (!Array.isArray(canary.steps)) {
        return;
      }

      canary.steps.splice(idx, 1);
    },
  },
};
</script>

<template>
  <div class="kruise-rollout-config">
    <Tabbed
      :side-tabs="true"
      :use-hash="false"
    >
      <Tab
        name="workload-ref"
        :label="t('kruiseRollout.config.tabs.workloadRef')"
        :weight="99"
      >
        <div class="section">
          <div class="form-row">
            <label class="form-label" for="kruise-rollout-workload-apiversion">{{ t('kruiseRollout.config.workloadRef.apiVersion') }}</label>
            <input
              id="kruise-rollout-workload-apiversion"
              v-model="workloadRef.apiVersion"
              type="text"
              class="input"
            >
          </div>

          <div class="form-row">
            <label class="form-label" for="kruise-rollout-workload-kind">{{ t('kruiseRollout.config.workloadRef.kind') }}</label>
            <input
              id="kruise-rollout-workload-kind"
              v-model="workloadRef.kind"
              type="text"
              class="input"
            >
          </div>

          <div class="form-row">
            <label class="form-label" for="kruise-rollout-workload-name">{{ t('kruiseRollout.config.workloadRef.name') }}</label>
            <LabeledSelect
              id="kruise-rollout-workload-name"
              v-model:value="workloadRef.name"
               :options="workloadOptions"
               :searchable="true"
               class="input"
               :label="t('kruiseRollout.config.workloadRef.namePlaceholder')"
            />
          </div>
        </div>
      </Tab>

      <Tab
        name="strategy"
        :label="t('kruiseRollout.config.tabs.strategy')"
        :weight="98"
      >
        <div class="section">
          <div class="form-row">
            <label class="form-label" for="kruise-rollout-strategy-type">{{ t('kruiseRollout.config.strategy.type') }}</label>
            <select
              id="kruise-rollout-strategy-type"
              v-model="strategyType"
               class="input"
             >
               <option value="canary">{{ t('kruiseRollout.config.strategy.options.canary') }}</option>
               <option value="blueGreen">{{ t('kruiseRollout.config.strategy.options.blueGreen') }}</option>
            </select>
          </div>

          <div
            v-if="strategyType === 'canary'"
            class="section"
          >
             <div class="form-row">
               <label class="form-label" for="kruise-rollout-canary-extra-workload">{{ t('kruiseRollout.config.canary.enableExtraWorkload') }}</label>
              <input
                id="kruise-rollout-canary-extra-workload"
                v-model="canaryStrategy.enableExtraWorkloadForCanary"
                type="checkbox"
              >
            </div>

             <div class="form-row steps-header">
               <span class="form-label">{{ t('kruiseRollout.config.canary.steps.title') }}</span>
              <button
                type="button"
                 class="btn-sm role-link"
                 @click="addCanaryStep"
               >
                 {{ t('kruiseRollout.config.canary.steps.add') }}
              </button>
            </div>

            <div
              v-for="(step, idx) in canaryStrategy.steps || []"
              :key="idx"
              class="form-row"
            >
               <label class="form-label">{{ t('kruiseRollout.config.canary.steps.stepLabel', { index: idx + 1 }) }}</label>
              <input
                v-model="step.replicas"
                 type="text"
                 class="input"
                 :placeholder="t('kruiseRollout.config.canary.steps.placeholder')"
              >
              <button
                type="button"
                 class="btn-sm role-link"
                 @click="removeCanaryStep(idx)"
               >
                 {{ t('kruiseRollout.config.canary.steps.remove') }}
              </button>
            </div>

             <p class="hint">
               {{ t('kruiseRollout.config.canary.steps.hint') }}
             </p>
          </div>
        </div>
      </Tab>
    </Tabbed>
  </div>
</template>

<style scoped>
.kruise-rollout-config {
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

.steps-header {
  justify-content: space-between;
}

.hint {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--text-muted);
}
</style>
