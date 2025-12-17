<script>
// Lightweight wrapper that only provides a styled Tabbed container for
// detail views. This intentionally does not implement the full
// ResourceTabs feature set (related resources, events, conditions,
// etc.), and is only responsible for rendering tabs and handling
// simple tab change events.

import Tabbed from '@shell/components/Tabbed';

export default {
  name: 'KruiseResourceTabsWrapper',

  components: { Tabbed },

  props: {
    // resource instance (kept for API compatibility with ResourceTabs)
    value: {
      type:    Object,
      default: () => ({}),
    },

    // view / edit mode (used only for CSS class like ResourceTabs)
    mode: {
      type:    String,
      default: 'view',
    },

    defaultTab: {
      type:    String,
      default: null,
    },

    useHash: {
      type:    Boolean,
      default: true,
    },
  },

  provide() {
    // Some higher-level Rancher components inject `update-count` from
    // detail views to refresh tab badges. Provide a no-op implementation
    // here to stay API-compatible without pulling in the full
    // `ResourceTabs` machinery.
    return { 'update-count': () => 0 };
  },

  methods: {
    tabChange(neu) {
      // Called when the underlying <Tabbed> component changes the
      // active tab. If follow-up behavior on tab change is needed in
      // the future, extend this handler.
      void neu;
    },
  },
};
</script>

<template>
  <Tabbed
    class="resource-tabs"
    :class="{ [mode]: true }"
    v-bind="$attrs"
    :default-tab="defaultTab"
    :use-hash="useHash"
    @changed="tabChange"
  >
    <slot />
  </Tabbed>
</template>

<style lang="scss" scoped>
.resource-tabs {
  // Align with Rancher detail page styling
  &.view {
    :deep() .tabs.horizontal {
      border: none;
    }

    :deep() .tabs.horizontal + .tab-container {
      border: none;
      border-top: 1px solid var(--border);
      padding: 0;
      padding-top: 24px;
    }
  }
}

</style>
