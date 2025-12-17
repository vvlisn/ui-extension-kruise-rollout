import { ROLLOUT_HEADERS, BATCH_RELEASE_HEADERS } from './table-headers';
import { KRUISE_ROLLOUT_PRODUCT_NAME, ROLLOUT_CRD, BATCH_RELEASE_CRD } from '../types';

// Initialize the Kruise Rollout product using the Rancher DSL.
// This registers Rollout & BatchRelease as their own product entry
// in the cluster Explorer navigation, instead of only extending
// existing built-in products.
//
// Use `any` here to avoid over-constraining the DSL API types; this
// matches other Rancher extensions and keeps the plugin API tolerant
// of upstream changes.
export function init(plugin: any, store: any): void {
  const {
    product,
    basicType,
    headers,
    weightType,
  } = plugin.DSL(store, KRUISE_ROLLOUT_PRODUCT_NAME);

  // Register Kruise Rollout as its own product so it shows up as a
  // top-level entry under the cluster store. The visible label comes
  // from `product.kruiseRollout` in the l10n files.
  product({
    inStore:             'cluster',
    inExplorer:          true,
    icon:                'generic',
    removeable:          false,
    showNamespaceFilter: true,
    weight:              0,
  });

  // Register the two CRD types within this product and give them
  // weights so they appear in a stable order beneath the product
  // entry.
  basicType([
    ROLLOUT_CRD,
    BATCH_RELEASE_CRD,
  ]);

  // Ensure Rollout and BatchRelease are ordered deterministically
  // within the product menu.
  weightType(ROLLOUT_CRD, 98, true);
  weightType(BATCH_RELEASE_CRD, 97, true);

  // Wire headers so the default ResourceTable shows useful information.
  headers(ROLLOUT_CRD, ROLLOUT_HEADERS);
  headers(BATCH_RELEASE_CRD, BATCH_RELEASE_HEADERS);
}
