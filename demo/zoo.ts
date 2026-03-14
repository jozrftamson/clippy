import { initAgent } from "../src/index.ts";
import * as agents from "../src/agents/index.ts";

const stage = document.getElementById("zoo-stage") as HTMLDivElement;
const status = document.getElementById("zoo-status") as HTMLSpanElement;
const count = document.getElementById("zoo-count") as HTMLSpanElement;
const animateAllBtn = document.getElementById("animate-all") as HTMLButtonElement;
const speakAllBtn = document.getElementById("speak-all") as HTMLButtonElement;
const resetAllBtn = document.getElementById("reset-all") as HTMLButtonElement;
const sharedAnimationSelect = document.getElementById("zoo-animation") as HTMLSelectElement;
const playSharedBtn = document.getElementById("play-shared") as HTMLButtonElement;

const entries = Object.entries(agents);
const zooAgents: { name: string; agent: any; x: number; y: number; animations: string[] }[] = [];

function layoutFor(index: number) {
  const columns = 4;
  const cellWidth = 230;
  const cellHeight = 170;
  const x = 36 + (index % columns) * cellWidth;
  const y = 40 + Math.floor(index / columns) * cellHeight;
  return { x, y };
}

function buildSharedAnimationList() {
  const animationCounts = new Map<string, number>();

  for (const entry of zooAgents) {
    for (const animation of entry.animations) {
      animationCounts.set(animation, (animationCounts.get(animation) || 0) + 1);
    }
  }

  const sharedAnimations = [...animationCounts.entries()]
    .filter(([, count]) => count > 1)
    .sort((a, b) => a[0].localeCompare(b[0]));

  sharedAnimationSelect.innerHTML = "";

  if (sharedAnimations.length === 0) {
    const option = document.createElement("option");
    option.textContent = "No shared animations";
    sharedAnimationSelect.appendChild(option);
    sharedAnimationSelect.disabled = true;
    playSharedBtn.disabled = true;
    return;
  }

  for (const [animation, supportedBy] of sharedAnimations) {
    const option = document.createElement("option");
    option.value = animation;
    option.textContent = `${animation} (${supportedBy})`;
    sharedAnimationSelect.appendChild(option);
  }

  sharedAnimationSelect.disabled = false;
  playSharedBtn.disabled = false;
}

async function loadZoo() {
  status.textContent = "Loading all agents...";

  for (const [index, [name, loader]] of entries.entries()) {
    const position = layoutFor(index);
    const agent = await initAgent(loader);
    const animations = agent.animations().sort();

    agent.show(true);
    agent.moveTo(position.x, position.y, 0);

    zooAgents.push({ name, agent, x: position.x, y: position.y, animations });
  }

  buildSharedAnimationList();
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

playSharedBtn.addEventListener("click", () => {
  const animation = sharedAnimationSelect.value;
  let played = 0;

  for (const entry of zooAgents) {
    if (!entry.animations.includes(animation)) {
      continue;
    }

    entry.agent.stop();
    entry.agent.play(animation);
    played += 1;
  }

  status.textContent = `Playing ${animation} on ${played} matching agents.`;
});

loadZoo().catch((error) => {
  console.error(error);
  status.textContent = "Failed to load the zoo demo.";
  stage.textContent = error instanceof Error ? error.message : String(error);
});
