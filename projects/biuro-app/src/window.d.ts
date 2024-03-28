import type { ContextBridgeApi } from './../../electron/src/preload';

declare global {
    interface Window {
        electron: ContextBridgeApi
    }
}