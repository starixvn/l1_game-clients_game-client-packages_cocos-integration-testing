import { debug } from "../debug";
import { TestCase } from "../test-case";
import { Job, sleep, waitUntilTrulyCallback } from "./utils";

export interface IClientContext {
  server: boolean;

  assert: <T>(test: TestCase, actual: T, expected: T) => void;
  evaluate: <T>(code: string) => Promise<T>;
}

export async function executeClient(
  { evaluate, assert }: IClientContext,
  job: Job
) {
  const { client } = job.data;

  if (client.delayForAction) {
    debug(job.data.name, `wait for action in ${client.delayForAction} ms`);

    await sleep(client.delayForAction);
  }

  if (client.action) {
    debug(job.data.name, `trigger action ${client.action}`);

    await evaluate(client.action);
  }

  if (client.delayForAssert) {
    debug(job.data.name, `wait for assert in ${client.delayForAssert} ms`);

    await sleep(client.delayForAssert);
  }

  if (client.waitUntilMetExpectation) {
    debug(
      job.data.name,
      `wait until the value of ${client.actual} to be ${client.expected}`
    );
    let timeout = 0;
    const interval = 100;

    const checkActualValue = async () => {
      timeout = timeout + interval;

      if (
        client.waitExpectationTimeout &&
        client.waitExpectationTimeout <= timeout
      ) {
        throw new Error(
          `Timeout when waiting until the value of ${client.actual} to be ${client.expected}`
        );
      }

      try {
        const actual = await evaluate(client.actual);

        return actual === client.expected;
      } catch {
        return false;
      }
    };

    await waitUntilTrulyCallback(checkActualValue, interval);
  }

  if (client.actual) {
    const actual = await evaluate(client.actual);

    assert(job.data, actual, client.expected);
  }
}
