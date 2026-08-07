import { createExplorerPanel } from "./ExplorerPanel";
import { ChaptersPanel } from "./panels/ChaptersPanel";

export const explorerPanels = [
  ChaptersPanel,
  createExplorerPanel({
    id: "sources",
    title: "Sources",
    icon: "📚",
  }),
  createExplorerPanel({
    id: "media",
    title: "Médias",
    icon: "🖼️",
  }),
  createExplorerPanel({
    id: "quiz",
    title: "Quiz",
    icon: "❓",
  }),
  createExplorerPanel({
    id: "ai",
    title: "Assistant IA",
    icon: "🤖",
  }),
  createExplorerPanel({
    id: "exports",
    title: "Exports",
    icon: "📤",
  }),
  createExplorerPanel({
    id: "settings",
    title: "Paramètres",
    icon: "⚙️",
  }),
];
