import { RibbonGroup } from "./RibbonGroup";
import { getEditorCommands } from "../editor/EditorCommandRegistry";

const groups = [
  {
    title: "Historique",
    commands: ["undo", "redo"],
  },
  {
    title: "Texte",
    commands: ["bold", "italic", "underline", "strike"],
  },
  {
    title: "Structure",
    commands: ["h1", "h2", "h3"],
  },
  {
    title: "Listes",
    commands: ["bullet", "ordered", "quote"],
  },
  {
    title: "Insertion",
    commands: ["link", "image", "table"],
  },
  {
    title: "IA",
    commands: ["ai"],
  },
];

export function Ribbon() {
  return `

<div class="editor-ribbon">

    ${groups
      .map((group) =>
        RibbonGroup(group.title, getEditorCommands(group.commands))
      )
      .join("")}

</div>

`;
}
