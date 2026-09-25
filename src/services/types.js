/**
 * Central JSDoc type registry for the Smart Hive blockchain domain.
 *
 * The project is plain JSX (no TypeScript toolchain), so type safety is
 * expressed as JSDoc typedefs. Every shared module re-exports from here so
 * payload shapes are declared exactly once (DRY) and stay checkable in editors.
 *
 * @module services/types
 */

/**
 * A geotag + wall-clock stamp captured at the moment of the shutter.
 * Injected into the evidence payload by `useGeotaggedCamera`.
 *
 * @typedef {object} GeoStamp
 * @property {number|null} latitude   WGS84 decimal degrees, null when denied.
 * @property {number|null} longitude  WGS84 decimal degrees, null when denied.
 * @property {number|null} accuracy   Horizontal accuracy radius in metres.
 * @property {string}  capturedAtUtc  ISO-8601 UTC instant of the capture.
 * @property {string}  source         'gps' | 'denied' | 'unavailable'
 */

/**
 * A single provenance timeline entry rendered on the consumer verification
 * viewport. Derived from one batch only - never mixed across batches.
 *
 * @typedef {object} ProvenanceStep
 * @property {string} key         Stable React key / dedupe id.
 * @property {string} actor       'Beekeeper' | 'Laboratory' | 'Retailer'
 * @property {string} title       Short human label.
 * @property {string} occurredAt  ISO-8601 (preferred) or display string.
 * @property {Array<{label: string, value: string}>} facts  Key/value detail rows.
 */

/**
 * Immutable evidence captured by the beekeeper traceability engine.
 *
 * @typedef {object} EvidencePayload
 * @property {string} dataUrl          Base64 image payload (no data: prefix leak).
 * @property {string} caption
 * @property {GeoStamp} geo
 * @property {string} capturedVia      'camera' | 'autofill'
 */

/**
 * Transit lifecycle for the retailer logistics board. The three values map
 * 1:1 to the pipeline columns and are the only legal states.
 *
 * @typedef {'in_transit' | 'delivered' | 'failed'} TransitStatus
 */

/**
 * A normalised volume/mass reading with an explicit unit, so the lineage
 * registry never renders a bare number.
 *
 * @typedef {object} Measure
 * @property {number} value
 * @property {'ml' | 'kg' | 'g' | 'l'} unit
 */

/**
 * Retailer-facing shipment card combining lineage, measure and transit state.
 *
 * @typedef {object} Shipment
 * @property {string} batchId
 * @property {string} farmOriginLabel  Human farm/apiary origin label.
 * @property {Measure} measure
 * @property {TransitStatus} status
 * @property {string} [destination]
 * @property {string} [eta]
 * @property {string} [note]
 */

/**
 * Result of an edge-AI inference call against the `/modeling` sidecar.
 *
 * @typedef {object} InfectionVerdict
 * @property {boolean} infected
 * @property {number}  confidence  0..1
 * @property {string}  label       Human-readable class name.
 * @property {boolean} degraded    True when the sidecar was unreachable and
 *                                 a heuristic fallback produced the verdict.
 */

/**
 * @typedef {import('./batchStore').Batch} Batch
 */

export {};
