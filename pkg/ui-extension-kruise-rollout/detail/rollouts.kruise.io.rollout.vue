<script>
import { defineComponent } from 'vue';
import RolloutDetail from '../components/RolloutDetail.vue';

export default defineComponent({
  name: 'KruiseRolloutDetailEntry',

  components: { RolloutDetail },

  props: {
    value: {
      type: Object,
      required: true,
    },
  },
});
</script>

<template>
  <RolloutDetail :value="value" />
</template>
