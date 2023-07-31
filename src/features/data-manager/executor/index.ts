import { IClientContext, executeClient } from "./client-job";
import { executeJob } from "./executor";
import { IServerContext, executeServer } from "./server-job";

export * from "./client-job";
export * from "./server-job";

export function startJob(context?: IClientContext | IServerContext) {
  if (context.server) {
    executeJob(context, executeServer);
  } else {
    executeJob(context, executeClient);
  }
}
