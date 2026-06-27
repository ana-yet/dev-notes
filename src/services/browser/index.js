/**
 * Browser Services — Barrel export.
 *
 * Import specific services:
 *   import { getCurrentTab } from '../services/browser/tabs'
 *   import { sendMessage } from '../services/browser/messaging'
 *
 * Or import everything:
 *   import * as browser from '../services/browser'
 */

export * as tabs from './tabs'
export * as runtime from './runtime'
export * as messaging from './messaging'
export * as notifications from './notifications'
