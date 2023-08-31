import { debug } from "../debug";
import { Manager } from "../manager";
import { IClientContext } from "./client-job";
import { IServerContext } from "./server-job";
import { Job, JobStatus } from "./utils";

export function executeJob(
  context: IServerContext | IClientContext,
  execute: (context: IServerContext | IClientContext, job: Job) => Promise<void>
) {
  const job = {
    status: JobStatus.STARTING,
    data: Manager.getTestCase(),
  };

  Manager.running = true;

  setInterval(async () => {
    if (
      !job.data ||
      (context.server && !job.data.server) ||
      (!context.server && !job.data.client)
    ) {
      job.data = Manager.getTestCase();
      job.status = JobStatus.STARTING;

      return;
    }

    if (job.status === JobStatus.RUNNING) {
      return;
    }

    job.status = JobStatus.RUNNING;
    debug(job.data.name, "running");

    try {
      await execute(context, job);
    } finally {
      job.status = JobStatus.ENDED;
    }

    if (job.status === JobStatus.ENDED) {
      debug(job.data.name, "ended");

      if (Manager.done()) {
        Manager.running = false;
      } else {
        job.data = Manager.getTestCase();
        job.status = JobStatus.STARTING;
      }
    }
  });
}
