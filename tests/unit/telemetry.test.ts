import { describe, expect, it, vi } from "vitest";
import {
  createNoopTelemetryClient,
  createTelemetryClient,
  defaultTelemetryClient
} from "../../src/telemetry/telemetry";
import type {
  TelemetryClient,
  TelemetryEvent
} from "../../src/telemetry/telemetryTypes";

function createTransport() {
  const calls: Array<{ input: RequestInfo | URL; init?: RequestInit }> = [];
  const transport: typeof fetch = (input, init) => {
    calls.push({ input, init });

    return Promise.resolve(new Response(null, { status: 204 }));
  };

  return { calls, transport: vi.fn(transport) };
}

function parseBody(init: RequestInit | undefined) {
  expect(init?.body).toEqual(expect.any(String));

  return JSON.parse(init?.body as string) as unknown;
}

describe("telemetry", () => {
  it("uses a no-op default client", () => {
    expect(
      defaultTelemetryClient.track({
        type: "runtime_error",
        category: "render"
      })
    ).toBeUndefined();
    expect(createNoopTelemetryClient()).toBe(defaultTelemetryClient);
  });

  it("does not send events when telemetry is disabled or invalid", () => {
    const { transport } = createTransport();

    createTelemetryClient(
      { enabled: false, endpoint: "/telemetry" },
      { transport }
    ).track({ type: "browser_capability", bucket: "webgl" });

    createTelemetryClient(
      { enabled: true, endpoint: "" },
      { transport }
    ).track({ type: "browser_capability", bucket: "webgl" });

    createTelemetryClient(
      { enabled: true, endpoint: "mailto:privacy@example.com" },
      { transport }
    ).track({ type: "browser_capability", bucket: "webgl" });

    createTelemetryClient(
      null as unknown as Parameters<typeof createTelemetryClient>[0],
      { transport }
    ).track({ type: "browser_capability", bucket: "webgl" });

    expect(transport).not.toHaveBeenCalled();
  });

  it("sends only typed event payloads when explicitly enabled", () => {
    const { calls, transport } = createTransport();
    const client = createTelemetryClient(
      { telemetry: { enabled: true, endpoint: "/telemetry" } },
      { transport }
    );
    const events: TelemetryEvent[] = [
      { type: "app_load_timing", bucket: "cold_start" },
      { type: "cesium_init_failure", category: "token_missing" },
      {
        type: "layer_load_failure",
        layerId: "weatherRadar",
        category: "metadata_failed"
      },
      { type: "runtime_error", category: "react_boundary" },
      { type: "frame_health", bucket: "fair" },
      { type: "browser_capability", bucket: "webgl2" }
    ];

    for (const event of events) {
      client.track(event);
    }

    expect(transport).toHaveBeenCalledTimes(events.length);
    expect(calls.map((call) => call.input)).toEqual(
      Array(events.length).fill("/telemetry")
    );
    expect(calls.map((call) => parseBody(call.init))).toEqual(events);
    expect(calls[0]?.init?.method).toBe("POST");
    expect(calls[0]?.init?.headers).toEqual({
      "content-type": "application/json"
    });
  });

  it("drops extra query, precise location, identity, and stack fields", () => {
    const { calls, transport } = createTransport();
    const client = createTelemetryClient(
      { enabled: true, endpoint: "https://example.com/telemetry" },
      { transport }
    );
    const eventWithDisallowedFields = {
      type: "runtime_error",
      category: "react_boundary",
      queryText: "mount fuji hotels",
      latitude: 35.360625,
      longitude: 138.727363,
      email: "person@example.com",
      accountId: "abc-123",
      stack: "Error: failed\n    at App.tsx:1"
    } as TelemetryEvent;

    client.track(eventWithDisallowedFields);

    expect(parseBody(calls[0]?.init)).toEqual({
      type: "runtime_error",
      category: "react_boundary"
    });
  });

  it("normalizes unsafe category and bucket values", () => {
    const { calls, transport } = createTransport();
    const client = createTelemetryClient(
      { enabled: true, endpoint: "/telemetry" },
      { transport }
    );

    client.track({
      type: "runtime_error",
      category: "Error: failed\n    at App.tsx:1"
    });
    client.track({
      type: "app_load_timing",
      bucket: "precise location 35.360625,138.727363"
    });

    expect(calls.map((call) => parseBody(call.init))).toEqual([
      { type: "runtime_error", category: "other" },
      { type: "app_load_timing", bucket: "other" }
    ]);
  });

  it("swallows telemetry transport failures", async () => {
    const asyncFailureTransport = vi.fn<typeof fetch>(() =>
      Promise.reject(new Error("network down"))
    );
    const syncFailureTransport = vi.fn<typeof fetch>(() => {
      throw new Error("transport unavailable");
    });

    const asyncFailureClient = createTelemetryClient(
      { enabled: true, endpoint: "/telemetry" },
      { transport: asyncFailureTransport }
    );
    const syncFailureClient = createTelemetryClient(
      { enabled: true, endpoint: "/telemetry" },
      { transport: syncFailureTransport }
    );

    expect(() =>
      asyncFailureClient.track({ type: "frame_health", bucket: "poor" })
    ).not.toThrow();
    await Promise.resolve();
    expect(() =>
      syncFailureClient.track({ type: "frame_health", bucket: "poor" })
    ).not.toThrow();
  });
});

const compileTimeClient: TelemetryClient = defaultTelemetryClient;
compileTimeClient.track({ type: "runtime_error", category: "render" });

compileTimeClient.track({
  type: "runtime_error",
  category: "search",
  // @ts-expect-error Search query text is intentionally unavailable.
  queryText: "mount fuji"
});

compileTimeClient.track({
  type: "browser_capability",
  bucket: "webgl",
  // @ts-expect-error Precise latitude and longitude are intentionally unavailable.
  latitude: 35.360625,
  longitude: 138.727363
});

compileTimeClient.track({
  type: "runtime_error",
  category: "auth",
  // @ts-expect-error Names, emails, and account identifiers are intentionally unavailable.
  email: "person@example.com",
  accountId: "abc-123"
});

compileTimeClient.track({
  type: "runtime_error",
  category: "react_boundary",
  // @ts-expect-error Raw stack traces are intentionally unavailable.
  stack: "Error: failed\n    at App.tsx:1"
});
