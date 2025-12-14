import { createRequestHandler } from "react-router";
import { WorkflowEntrypoint, type WorkflowStep, type WorkflowEvent } from 'cloudflare:workers';
import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "../db/schema";

declare global {
  interface CloudflareEnvironment extends Env { }
}

export class MyWorkflow extends WorkflowEntrypoint<Env> {
  override async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
    await step.do("first step", async () => {
      return { output: "First step result" };
    });

    await step.sleep("sleep", "1 second");

    await step.do("second step", async () => {
      return { output: "Second step result" };
    });

    return "Workflow output";
  }
}

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: {
      env: Env;
      ctx: ExecutionContext;
    };
    db: DrizzleD1Database<typeof schema>;
  }
}

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE
);

export default {
  async fetch(request, env, ctx) {
    const db = drizzle(env.DB, {
      schema,
    });
    return requestHandler(request, {
      cloudflare: { env, ctx },
      db,
    });
  },
} satisfies ExportedHandler<Env>;
