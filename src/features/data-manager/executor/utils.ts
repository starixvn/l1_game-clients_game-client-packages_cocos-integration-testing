import { debug } from "../debug";
import { TestCase } from "../test-case";

export enum JobStatus {
  STARTING = 1,
  RUNNING,
  ENDED,
}

export type Job = {
  status: JobStatus;
  data: TestCase;
};

export async function sleep(time: number) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), time);
  });
}

export async function delay(test: TestCase) {
  if (test.server?.delay) {
    debug(test.name, `delay after ${test.server?.delay}ms`);

    await sleep(test.server?.delay);
  }
}

export async function waitUntilTrulyCallback(
  callback: () => Promise<boolean>,
  interval = 100
) {
  let result = await callback();

  while (!result) {
    sleep(interval);

    result = await callback();
  }
}
