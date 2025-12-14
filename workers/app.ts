import { createRequestHandler } from "react-router";
import { WorkflowEntrypoint, type WorkflowStep, type WorkflowEvent } from 'cloudflare:workers';

declare global {
  interface CloudflareEnvironment extends Env { }
}

type Env = {
  MY_WORKFLOW: Workflow;
};

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
  }
}

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE
);

export default {
  async fetch(request, env, ctx) {
    return requestHandler(request, {
      cloudflare: { env, ctx },
    });
  },
} satisfies ExportedHandler<Env>;
