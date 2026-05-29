import type { KnipConfig } from "knip";

const config: KnipConfig = {
  entry: ["workers/scheduled.ts"],
  ignore: ["bridge/**", "env.d.ts"],
  ignoreDependencies: ["cloudflare"],
  ignoreExportsUsedInFile: {
    interface: true,
    type: true,
  },
};

export default config;
