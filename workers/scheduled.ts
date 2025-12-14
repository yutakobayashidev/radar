import { MyWorkflow } from './workflow';

// Re-export workflow for binding
export { MyWorkflow };

declare global {
  interface CloudflareEnvironment extends Env { }
}

export default {
  async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    console.log("⏰ Scheduled trigger fired");
    ctx.waitUntil(
      (async () => {
        try {
          const instance = await env.MY_WORKFLOW.create({
            params: {
              reason: "cron",
              cron: controller.cron,
              scheduledTime: new Date(controller.scheduledTime).toISOString(),
            },
          });
          console.log(`✅ Workflow instance created: ${instance.id}`);
        } catch (error) {
          console.error("❌ Failed to create workflow instance:", error);
        }
      })(),
    );
  },
} satisfies ExportedHandler<Env>;
