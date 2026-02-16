import { afterEach, describe, expect, it, vi } from "vitest";
import {
  clearOfflineQueue,
  enqueueOfflineEvent,
  getOfflineQueueSize,
  offlineQueueChangedEventName
} from "../../app/src/lib/offlineQueue";

const eventTarget = new EventTarget();
const storage = new Map<string, string>();

if (typeof CustomEvent === "undefined") {
  class NodeCustomEvent<T = unknown> extends Event {
    detail?: T;

    constructor(type: string, options?: CustomEventInit<T>) {
      super(type);
      this.detail = options?.detail;
    }
  }

  (globalThis as { CustomEvent?: typeof CustomEvent }).CustomEvent =
    NodeCustomEvent as unknown as typeof CustomEvent;
}

(globalThis as { window?: unknown }).window = {
  localStorage: {
    getItem(key: string) {
      return storage.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      storage.set(key, value);
    },
    removeItem(key: string) {
      storage.delete(key);
    }
  },
  addEventListener: eventTarget.addEventListener.bind(eventTarget),
  removeEventListener: eventTarget.removeEventListener.bind(eventTarget),
  dispatchEvent: eventTarget.dispatchEvent.bind(eventTarget)
} as Window;

afterEach(() => {
  clearOfflineQueue();
  storage.clear();
  vi.unstubAllGlobals();
});

describe("offlineQueue", () => {
  it("tracks queue size and dispatches queue changed event", () => {
    const handler = vi.fn();
    window.addEventListener(offlineQueueChangedEventName, handler);

    enqueueOfflineEvent({
      endpoint: "/api/letter-open",
      payload: { letterId: "sad-day" }
    });

    expect(getOfflineQueueSize()).toBe(1);
    expect(handler).toHaveBeenCalledTimes(1);

    clearOfflineQueue();

    expect(getOfflineQueueSize()).toBe(0);
    expect(handler).toHaveBeenCalledTimes(2);

    window.removeEventListener(offlineQueueChangedEventName, handler);
  });
});
