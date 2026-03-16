import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { defineBuildConfig } from "obuild/config";

const agents = [
  "bonzi",
  "clippy",
  "f1",
  "genie",
  "genius",
  "links",
  "merlin",
  "peedy",
  "rocky",
  "rover",
];

const inlinePngPlugin = {
  name: "inline-png",
  resolveId(source, importer) {
    if (source.endsWith(".png") && importer) {
      return resolve(dirname(importer), source);
    }
  },
  load(id) {
    if (id.endsWith(".png")) {
      const base64 = readFileSync(id, "base64");
      return `export default "data:image/png;base64,${base64}"`;
    }
  },
};

let isLegacyBuild = false;

export default defineBuildConfig({
  entries: [
    {
      type: "bundle",
      input: [
        "./src/index.ts",
        "./src/agents/index.ts",
        ...agents.map((agent) => `./src/agents/${agent}/index.ts`),
      ],
      rolldown: {
        plugins: [inlinePngPlugin],
      },
    },
    {
      type: "bundle",
      input: "./src/legacy.ts",
      minify: true,
      dts: false,
      rolldown: {
        platform: "browser",
        plugins: [inlinePngPlugin],
      },
    },
  ],
  hooks: {
    rolldownConfig(cfg) {
      isLegacyBuild = Object.values(cfg.input || {}).some((p) =>
        String(p).replaceAll("\\", "/").endsWith("/src/legacy.ts"),
      );
    },
    rolldownOutput(cfg) {
      if (isLegacyBuild) {
        cfg.format = "iife";
        cfg.name = "clippy";
        cfg.entryFileNames = "clippy.min.js";
        cfg.chunkFileNames = "_chunks/[name].js";
        return;
      }

      cfg.chunkFileNames = ({ facadeModuleId, moduleIds }) => {
        // src/agents/[name]/*.*
        const agentName = /src\/agents\/([^/]+)\//.exec(facadeModuleId || moduleIds[0])?.[1];
        if (agentName) {
          return `agents/${agentName}/[name].mjs`;
        }
        return "[name].mjs";
      };
    },
  },
});
