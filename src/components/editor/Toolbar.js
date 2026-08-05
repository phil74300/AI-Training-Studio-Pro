import {
  getEditor
} from "./RichEditor";

const buttons = [

  {
    id: "undo",
    label: "↶",
    action: editor =>
      editor.chain().focus().undo().run(),
    active: () => false,
    enabled: editor => editor.can().undo()
  },

  {
    id: "redo",
    label: "↷",
    action: editor =>
      editor.chain().focus().redo().run(),
    active: () => false,
    enabled: editor => editor.can().redo()
  },

  { separator: true },

  {
    id: "bold",
    label: "<b>B</b>",
    action: editor =>
      editor.chain().focus().toggleBold().run(),
    active: editor => editor.isActive("bold"),
    enabled: editor => editor.can().toggleBold()
  },

  {
    id: "italic",
    label: "<i>I</i>",
    action: editor =>
      editor.chain().focus().toggleItalic().run(),
    active: editor => editor.isActive("italic"),
    enabled: editor => editor.can().toggleItalic()
  },

  {
    id: "strike",
    label: "<s>S</s>",
    action: editor =>
      editor.chain().focus().toggleStrike().run(),
    active: editor => editor.isActive("strike"),
    enabled: editor => editor.can().toggleStrike()
  },

  { separator: true },

  {
    id: "h1",
    label: "H1",
    action: editor =>
      editor.chain().focus().toggleHeading({ level: 1 }).run(),
    active: editor =>
      editor.isActive("heading", { level: 1 }),
    enabled: editor =>
      editor.can().toggleHeading({ level: 1 })
  },

  {
    id: "h2",
    label: "H2",
    action: editor =>
      editor.chain().focus().toggleHeading({ level: 2 }).run(),
    active: editor =>
      editor.isActive("heading", { level: 2 }),
    enabled: editor =>
      editor.can().toggleHeading({ level: 2 })
  },

  { separator: true },

  {
    id: "bullet",
    label: "•",
    action: editor =>
      editor.chain().focus().toggleBulletList().run(),
    active: editor =>
      editor.isActive("bulletList"),
    enabled: editor =>
      editor.can().toggleBulletList()
  },

  {
    id: "ordered",
    label: "1.",
    action: editor =>
      editor.chain().focus().toggleOrderedList().run(),
    active: editor =>
      editor.isActive("orderedList"),
    enabled: editor =>
      editor.can().toggleOrderedList()
  },

  { separator: true },

  {
    id: "quote",
    label: "❝",
    action: editor =>
      editor.chain().focus().toggleBlockquote().run(),
    active: editor =>
      editor.isActive("blockquote"),
    enabled: editor =>
      editor.can().toggleBlockquote()
  }

];

export function Toolbar() {

  return `

<div class="editor-toolbar">

${buttons.map(button => {

  if (button.separator) {
    return `<div class="toolbar-separator"></div>`;
  }

  return `

<button
class="toolbar-button"
id="toolbar-${button.id}">

${button.label}

</button>

`;

}).join("")}

</div>

`;

}

export function initToolbar() {

  const editor = getEditor();

  if (!editor) return;

  buttons.forEach(button => {

    if (button.separator) return;

    const element =
      document.getElementById(
        `toolbar-${button.id}`
      );

    if (!element) return;

    element.onclick = () => {

      button.action(editor);

      updateToolbar();

    };

  });

  document.addEventListener(
    "editor:refresh",
    updateToolbar
  );

  updateToolbar();

}

function updateToolbar() {

  const editor = getEditor();

  if (!editor) return;

  buttons.forEach(button => {

    if (button.separator) return;

    const element =
      document.getElementById(
        `toolbar-${button.id}`
      );

    if (!element) return;

    element.classList.toggle(
      "active",
      button.active(editor)
    );

    element.disabled =
      !button.enabled(editor);

  });

}