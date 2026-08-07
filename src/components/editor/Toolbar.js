import { getEditor } from "./RichEditor";
import {
  executeEditorCommand,
  getEditorCommandState,
  getEditorCommands,
} from "./EditorCommandRegistry";

const buttons = [
  ...getEditorCommands(["undo", "redo"]),
  { separator: true },
  ...getEditorCommands(["bold", "italic", "strike"]),
  { separator: true },
  ...getEditorCommands(["h1", "h2"]),
  { separator: true },
  ...getEditorCommands(["bullet", "ordered"]),
  { separator: true },
  ...getEditorCommands(["quote"]),
];

export function Toolbar() {
  return `

<div class="editor-toolbar">

${buttons
  .map((button) => {
    if (button.separator) {
      return `<div class="toolbar-separator"></div>`;
    }

    return `

<button
class="toolbar-button"
id="toolbar-${button.id}">

${button.toolbarLabel}

</button>

`;
  })
  .join("")}

</div>

`;
}

export function initToolbar(signal) {
  const editor = getEditor();

  if (!editor) return;

  buttons.forEach((button) => {
    if (button.separator) return;

    const element = document.getElementById(`toolbar-${button.id}`);

    if (!element) return;

    element.addEventListener(
      "click",
      () => {
        executeEditorCommand(button.id, editor);

        updateToolbar();
      },
      { signal }
    );
  });

  document.addEventListener("editor:refresh", updateToolbar, { signal });

  updateToolbar();
}

function updateToolbar() {
  const editor = getEditor();

  if (!editor) return;

  buttons.forEach((button) => {
    if (button.separator) return;

    const element = document.getElementById(`toolbar-${button.id}`);

    if (!element) return;

    const state = getEditorCommandState(button.id, editor);

    element.classList.toggle("active", state.active);

    element.disabled = !state.enabled;
  });
}
