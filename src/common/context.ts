import type { Application } from "express";
import type { Server } from "socket.io";

export interface IContext {
  socket?: Server;

  express?: Application;
}
