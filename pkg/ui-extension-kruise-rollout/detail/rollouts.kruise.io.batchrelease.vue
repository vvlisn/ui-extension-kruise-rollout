<script>
import { defineComponent } from 'vue';
import BatchReleaseDetail from '../components/BatchReleaseDetail.vue';

export default defineComponent({
  name: 'KruiseBatchReleaseDetailEntry',

  components: { BatchReleaseDetail },

  props: {
    value: {
      type: Object,
      required: true,
    },
  },
});
</script>

<template>
  <BatchReleaseDetail :value="value" />
</template>
