type QueueItem = {
  endpoint: string;
  payload: unknown;
};

const queueStorageKey = "openme.offlineEventQueue";
const queueChangedEvent = "openme:offline-queue-changed";

function readQueue(): QueueItem[] {
  try {
    const raw = window.localStorage.getItem(queueStorageKey);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as QueueItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeQueue(queue: QueueItem[]) {
  window.localStorage.setItem(queueStorageKey, JSON.stringify(queue));

  window.dispatchEvent(
    new CustomEvent(queueChangedEvent, {
      detail: {
        count: queue.length
      }
    })
  );
}

export function getOfflineQueueSize() {
  return readQueue().length;
}

export function clearOfflineQueue() {
  writeQueue([]);
}

export const offlineQueueChangedEventName = queueChangedEvent;

export function enqueueOfflineEvent(item: QueueItem) {
  const queue = readQueue();
  queue.push(item);
  writeQueue(queue);
}

async function sendEvent(item: QueueItem) {
  const response = await fetch(item.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(item.payload)
  });

  if (!response.ok) {
    throw new Error(`Failed ${item.endpoint} with status ${response.status}`);
  }
}

export async function postEventWithOfflineQueue(item: QueueItem) {
  if (!navigator.onLine) {
    enqueueOfflineEvent(item);
    return;
  }

  try {
    await sendEvent(item);
  } catch {
    enqueueOfflineEvent(item);
  }
}

export async function flushOfflineEventQueue() {
  const queue = readQueue();
  if (!queue.length) {
    return;
  }

  const remaining: QueueItem[] = [];

  for (const item of queue) {
    try {
      await sendEvent(item);
    } catch {
      remaining.push(item);
    }
  }

  writeQueue(remaining);
}
