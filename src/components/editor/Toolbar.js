import { getEditor } from "./RichEditor";

const buttons = [

  { id: "undo", label: "↶", action: e => e.chain().focus().undo().run() },
  { id: "redo", label: "↷", action: e => e.chain().focus().redo().run() },

  { separator: true },

  { id: "bold", label: "<b>B</b>", action: e => e.chain().focus().toggleBold().run() },
  { id: "italic", label: "<i>I</i>", action: e => e.chain().focus().toggleItalic().run() },
  { id: "strike", label: "<s>S</s>", action: e => e.chain().focus().toggleStrike().run() },

  { separator: true },

  { id: "h1", label: "H1", action: e => e.chain().focus().toggleHeading({ level: 1 }).run() },
  { id: "h2", label: "H2", action: e => e.chain().focus().toggleHeading({ level: 2 }).run() },

  { separator: true },

  { id: "bullet", label: "•", action: e => e.chain().focus().toggleBulletList().run() },
  { id: "ordered", label: "1.", action: e => e.chain().focus().toggleOrderedList().run() },

  { separator: true },

  { id: "quote", label: "❝", action: e => e.chain().focus().toggleBlockquote().run() }

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
    data-command="${button.id}">

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

  document
    .querySelectorAll(".toolbar-button")
    .forEach(button => {

      const config = buttons.find(
        b => b.id === button.dataset.command
      );

      if (!config) return;

      button.onclick = () => {

        config.action(editor);

        editor.commands.focus();

      };

    });

}