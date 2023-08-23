import { RawData } from "./loader";

export type Event = {
  namespace: string;
  event: string;
  payload: any;
  timestamp: number;
};

export type TestCase = {
  name?: string;
  server?: {
    response: Event[];
    waitForRequest?: Event;
    delay?: number;
  };
  client: {
    delayForAssert?: number;
    delayForAction?: number;
    waitUntilMetExpectation?: boolean;
    action?: string;
    actual?: string;
    expected?: unknown;
  };
};

export function rawToTestCases(raw: RawData): TestCase[] {
  if (Array.isArray(raw.data)) {
    return raw.data;
  }

  return [raw.data as TestCase];
}
