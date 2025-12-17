<script>
import { _CREATE, _EDIT, _CLONE } from '@shell/config/query-params';
import CreateEditView from '@shell/mixins/create-edit-view';

import CruResource from '@shell/components/CruResource';
import NameNsDescription from '@shell/components/form/NameNsDescription';
import { SCALABLE_WORKLOAD_TYPES } from '@shell/config/types';
import RolloutConfig from '../components/RolloutConfig.vue';

export default {
  name: 'KruiseRolloutEdit',

  components: {
    CruResource,
    NameNsDescription,
    RolloutConfig,
  },

  mixins: [CreateEditView],

  props: {
    // The Rollout resource being created or edited
    value: {
      type:     Object,
      required: true,
    },

    // "Visual" mode from the route (edit, view, etc)
    mode: {
      type:    String,
      default: _EDIT,
    },

    // Actual CRUD mode used by CreateEditView (_CREATE, _EDIT, _CLONE)
    realMode: {
      type:    String,
      default: _EDIT,
    },
  },

  computed: {
    isCreate() {
      return this.realMode === _CREATE;
    },

    isClone() {
      return this.realMode === _CLONE;
    },

    schema() {
      return this.$store.getters['cluster/schemaFor'](this.value.type);
    },
  },

  async fetch() {
    // Ensure resourceFields are loaded so CruResource can build a form
    // from the schema (like other generic CRD edit pages in Rancher).
    const schema = this.$store.getters['cluster/schemaFor'](this.value.type);

    const promises = [];

    if (schema && schema.fetchResourceFields) {
      promises.push(schema.fetchResourceFields());
    }

    // Preload all scalable workloads in the current cluster so that
    // the RolloutConfig component can list Deployments in the
    // "Workload Reference" → "Name" dropdown.
    promises.push(
      ...Object.values(SCALABLE_WORKLOAD_TYPES || {}).map((type) =>
        this.$store.dispatch('cluster/findAll', { type })
      )
    );

    await Promise.all(promises);
  },

  methods: {
    async finish(event) {
      const collectionLink = this.schema?.linkFor('collection') || '';

      await this.save(event, collectionLink);
    },
  },
};
</script>

<template>
  <CruResource
    :errors="errors"
    :resource="value"
    :mode="realMode"
    :can-yaml="true"
    :done-route="doneRoute"
    @finish="finish"
  >
    <NameNsDescription
      :value="value"
      :mode="realMode"
    />

    <RolloutConfig :value="value" :mode="realMode" />
  </CruResource>
</template>
