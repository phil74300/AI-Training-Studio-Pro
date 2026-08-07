import { getEditor } from "../editor/RichEditor";
import {
  executeEditorCommand,
  getEditorCommandState,
  getEditorCommands,
} from "../editor/EditorCommandRegistry";

const commandIds = [
  "undo",
  "redo",
  "bold",
  "italic",
  "underline",
  "strike",
  "h1",
  "h2",
  "h3",
  "bullet",
  "ordered",
  "quote",
  "link",
  "image",
  "table",
  "ai",
];

export function initRibbon(signal) {
  bindButtons(signal);

  document.addEventListener("editor:refresh", refreshRibbon, { signal });

  refreshRibbon();
}

function bindButtons(signal) {
  getEditorCommands(commandIds).forEach((command) => {
    const button = document.getElementById(`ribbon-${command.id}`);

    if (!button) return;

    button.addEventListener(
      "click",
      () => {
        executeEditorCommand(command.id, getEditor());
        refreshRibbon();
      },
      { signal }
    );
  });
}

function refreshRibbon() {
  const editor = getEditor();

  getEditorCommands(commandIds).forEach((command) => {
    const button = document.getElementById(`ribbon-${command.id}`);

    if (!button) return;

    const state = getEditorCommandState(command.id, editor);

    button.classList.toggle("active", state.active);
    button.disabled = !state.enabled;
  });
}
