import { Event } from "..";
import { Connection } from "../../connections";
import { debug } from "../debug";
import { Job, delay } from "./utils";

export interface IServerContext {
  server?: boolean;
}

export async function sendResponse(events: Event[]) {
  await Promise.all(
    events.map(async ({ namespace, event, payload }) => {
      await Connection.waitConnection(namespace);

      Connection.emit(namespace, event, payload);
    })
  );
}

export async function executeServer(_: IServerContext, job: Job) {
  const { server } = job.data;

  if (!server.waitForRequest) {
    await delay(job.data);
    await sendResponse(server.response);
  } else {
    const { waitForRequest } = server;
    const { namespace, event } = waitForRequest;
    const isMatchPayload = (payload: unknown) =>
      payload === waitForRequest.payload ||
      JSON.stringify(payload) === JSON.stringify(waitForRequest.payload);

    debug(
      job.data.name,
      "waiting for request\n",
      JSON.stringify(waitForRequest, null, 4)
    );

    await Connection.waitUntil(namespace, event, isMatchPayload);
    await delay(job.data);
    await sendResponse(server.response);
  }
}
