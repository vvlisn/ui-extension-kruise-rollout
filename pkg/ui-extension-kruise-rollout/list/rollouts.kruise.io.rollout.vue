<script>
import { defineComponent } from 'vue';
import ResourceTable from '@shell/components/ResourceTable';
import Loading from '@shell/components/Loading';

export default defineComponent({
  name: 'RolloutList',

  provide() {
    return { 'update-count': () => 0 };
  },

  components: {
    ResourceTable,
    Loading
  },

  props: {
    resource: {
      type:     String,
      required: true,
    },
    schema: {
      type:     Object,
      required: true,
    },
  },

  data() {
    return {
      isLoading: true
    };
  },

  async mounted() {
    try {
      await this.$store.dispatch('cluster/findAll', { type: this.resource });
    } finally {
      this.isLoading = false;
    }
  },

  computed: {
    headers() {
      return this.$store.getters['type-map/headersFor'](this.schema);
    },
    rows() {
      return this.$store.getters['cluster/all'](this.resource);
    }
  }
});
</script>

<template>
  <Loading v-if="isLoading" />
  <ResourceTable
    v-else
    :schema="schema"
    :rows="rows"
    :headers="headers"
  />
</template>
