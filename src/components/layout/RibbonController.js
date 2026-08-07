import { execute, getEditor } from "../editor/RichEditor";

const commands = {
  undo: "undo",
  redo: "redo",

  bold: "bold",
  italic: "italic",
  underline: "underline",
  strike: "strike",

  h1: "h1",
  h2: "h2",
  h3: "h3",

  bullet: "bullet",
  ordered: "ordered",
  quote: "quote",
};

export function initRibbon(signal) {
  bindButtons(signal);

  document.addEventListener("editor:refresh", refreshRibbon, { signal });

  refreshRibbon();
}

function bindButtons(signal) {
  Object.keys(commands).forEach((id) => {
    const button = document.getElementById(`ribbon-${id}`);

    if (!button) return;

    button.addEventListener(
      "click",
      () => {
        execute(commands[id]);
      },
      { signal }
    );
  });
}

function refreshRibbon() {
  const editor = getEditor();

  if (!editor) return;

  updateToggle("bold", editor.isActive("bold"));

  updateToggle("italic", editor.isActive("italic"));

  updateToggle("underline", editor.isActive("underline"));

  updateToggle("strike", editor.isActive("strike"));

  updateToggle(
    "h1",
    editor.isActive("heading", {
      level: 1,
    })
  );

  updateToggle(
    "h2",
    editor.isActive("heading", {
      level: 2,
    })
  );

  updateToggle(
    "h3",
    editor.isActive("heading", {
      level: 3,
    })
  );

  updateToggle("bullet", editor.isActive("bulletList"));

  updateToggle("ordered", editor.isActive("orderedList"));

  updateToggle("quote", editor.isActive("blockquote"));
}

function updateToggle(id, active) {
  const button = document.getElementById(`ribbon-${id}`);

  if (!button) return;

  button.classList.toggle("active", active);
}
