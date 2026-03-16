import { initAgent } from "./agent.ts";

import BonziData from "./agents/bonzi/agent.ts";
import BonziSounds from "./agents/bonzi/sounds-mp3.ts";
import BonziMap from "./agents/bonzi/map.png";

import ClippyData from "./agents/clippy/agent.ts";
import ClippySounds from "./agents/clippy/sounds-mp3.ts";
import ClippyMap from "./agents/clippy/map.png";

import F1Data from "./agents/f1/agent.ts";
import F1Sounds from "./agents/f1/sounds-mp3.ts";
import F1Map from "./agents/f1/map.png";

import GenieData from "./agents/genie/agent.ts";
import GenieSounds from "./agents/genie/sounds-mp3.ts";
import GenieMap from "./agents/genie/map.png";

import GeniusData from "./agents/genius/agent.ts";
import GeniusSounds from "./agents/genius/sounds-mp3.ts";
import GeniusMap from "./agents/genius/map.png";

import LinksData from "./agents/links/agent.ts";
import LinksSounds from "./agents/links/sounds-mp3.ts";
import LinksMap from "./agents/links/map.png";

import MerlinData from "./agents/merlin/agent.ts";
import MerlinSounds from "./agents/merlin/sounds-mp3.ts";
import MerlinMap from "./agents/merlin/map.png";

import PeedyData from "./agents/peedy/agent.ts";
import PeedySounds from "./agents/peedy/sounds-mp3.ts";
import PeedyMap from "./agents/peedy/map.png";

import RockyData from "./agents/rocky/agent.ts";
import RockySounds from "./agents/rocky/sounds-mp3.ts";
import RockyMap from "./agents/rocky/map.png";

import RoverData from "./agents/rover/agent.ts";
import RoverSounds from "./agents/rover/sounds-mp3.ts";
import RoverMap from "./agents/rover/map.png";

type LegacyCallback = (agent: any) => void;

function createLoaders(data: any, map: string, sounds: any) {
  return {
    agent: async () => ({ default: data }),
    map: async () => ({ default: map }),
    sound: async () => ({ default: sounds }),
  };
}

const agentLoadersByName = {
  bonzi: createLoaders(BonziData, BonziMap, BonziSounds),
  clippy: createLoaders(ClippyData, ClippyMap, ClippySounds),
  f1: createLoaders(F1Data, F1Map, F1Sounds),
  genie: createLoaders(GenieData, GenieMap, GenieSounds),
  genius: createLoaders(GeniusData, GeniusMap, GeniusSounds),
  links: createLoaders(LinksData, LinksMap, LinksSounds),
  merlin: createLoaders(MerlinData, MerlinMap, MerlinSounds),
  peedy: createLoaders(PeedyData, PeedyMap, PeedySounds),
  rocky: createLoaders(RockyData, RockyMap, RockySounds),
  rover: createLoaders(RoverData, RoverMap, RoverSounds),
} as const;

function normalizeAgentName(name: string) {
  return (name || "").trim().toLowerCase();
}

async function load(agentName: string, callback?: LegacyCallback, _selector?: any, _basePath?: string) {
  const name = normalizeAgentName(agentName);
  const loaders = agentLoadersByName[name as keyof typeof agentLoadersByName];
  if (!loaders) {
    throw new Error(`Unknown agent "${agentName}". Available: ${Object.keys(agentLoadersByName).join(", ")}`);
  }
  const agent = await initAgent(loaders);
  if (callback) callback(agent);
  return agent;
}

const legacyApi = {
  BASE_PATH: "",
  load,
};

const g = globalThis as any;
g.clippy = legacyApi;
g.clippyjs = legacyApi;

