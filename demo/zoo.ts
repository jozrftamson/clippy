import { initAgent } from "../src/index.ts";
import * as agents from "../src/agents/index.ts";

const stage = document.getElementById("zoo-stage") as HTMLDivElement;
const status = document.getElementById("zoo-status") as HTMLSpanElement;
const count = document.getElementById("zoo-count") as HTMLSpanElement;
const animateAllBtn = document.getElementById("animate-all") as HTMLButtonElement;
const speakAllBtn = document.getElementById("speak-all") as HTMLButtonElement;
const resetAllBtn = document.getElementById("reset-all") as HTMLButtonElement;

const entries = Object.entries(agents);
const zooAgents: { name: string; agent: any; x: number; y: number }[] = [];

function layoutFor(index: number) {
  const columns = 4;
  const cellWidth = 230;
  const cellHeight = 170;
  const x = 36 + (index % columns) * cellWidth;
  const y = 40 + Math.floor(index / columns) * cellHeight;
  return { x, y };
}

async function loadZoo() {
  status.textContent = "Loading all agents...";

  for (const [index, [name, loader]] of entries.entries()) {
    const position = layoutFor(index);
    const agent = await initAgent(loader);

    agent.show(true);
    agent.moveTo(position.x, position.y, 0);

    zooAgents.push({ name, agent, x: position.x, y: position.y });
  }

  count.textContent = `${zooAgents.length} agents`;
  status.textContent = "All agents loaded.";
}

animateAllBtn.addEventListener("click", () => {
  for (const entry of zooAgents) {
    entry.agent.animate();
  }
  status.textContent = "Animating all agents.";
});

speakAllBtn.addEventListener("click", () => {
  zooAgents.forEach((entry, index) => {
    window.setTimeout(() => {
      entry.agent.speak(`Hello from ${entry.name}.`);
      entry.agent.animate();
    }, index * 250);
  });
  status.textContent = "Starting roll call.";
});

resetAllBtn.addEventListener("click", () => {
  for (const entry of zooAgents) {
    entry.agent.stop();
    entry.agent.moveTo(entry.x, entry.y, 0);
  }
  status.textContent = "Reset all agents.";
});

loadZoo().catch((error) => {
  console.error(error);
  status.textContent = "Failed to load the zoo demo.";
  stage.textContent = error instanceof Error ? error.message : String(error);
});
