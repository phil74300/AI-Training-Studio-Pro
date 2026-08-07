const unsupportedCommand = ({ id, title, ribbonIcon }) => ({
  id,
  title,
  ribbonIcon,
  supported: false,
  execute: () => false,
  enabled: () => false,
  active: () => false,
});

export const editorCommands = [
  {
    id: "undo",
    title: "Annuler",
    toolbarLabel: "↶",
    ribbonIcon: "↶",
    supported: true,
    execute: (editor) => editor.chain().focus().undo().run(),
    enabled: (editor) => editor.can().undo(),
    active: () => false,
  },
  {
    id: "redo",
    title: "Rétablir",
    toolbarLabel: "↷",
    ribbonIcon: "↷",
    supported: true,
    execute: (editor) => editor.chain().focus().redo().run(),
    enabled: (editor) => editor.can().redo(),
    active: () => false,
  },
  {
    id: "bold",
    title: "Gras",
    toolbarLabel: "<b>B</b>",
    ribbonIcon: "<b>B</b>",
    supported: true,
    execute: (editor) => editor.chain().focus().toggleBold().run(),
    enabled: (editor) => editor.can().toggleBold(),
    active: (editor) => editor.isActive("bold"),
  },
  {
    id: "italic",
    title: "Italique",
    toolbarLabel: "<i>I</i>",
    ribbonIcon: "<i>I</i>",
    supported: true,
    execute: (editor) => editor.chain().focus().toggleItalic().run(),
    enabled: (editor) => editor.can().toggleItalic(),
    active: (editor) => editor.isActive("italic"),
  },
  {
    id: "underline",
    title: "Souligné",
    ribbonIcon: "<u>U</u>",
    supported: true,
    execute: (editor) => editor.chain().focus().toggleUnderline().run(),
    enabled: (editor) => editor.can().toggleUnderline(),
    active: (editor) => editor.isActive("underline"),
  },
  {
    id: "strike",
    title: "Barré",
    toolbarLabel: "<s>S</s>",
    ribbonIcon: "<s>S</s>",
    supported: true,
    execute: (editor) => editor.chain().focus().toggleStrike().run(),
    enabled: (editor) => editor.can().toggleStrike(),
    active: (editor) => editor.isActive("strike"),
  },
  {
    id: "h1",
    title: "Titre 1",
    toolbarLabel: "H1",
    ribbonIcon: "H1",
    supported: true,
    execute: (editor) =>
      editor.chain().focus().toggleHeading({ level: 1 }).run(),
    enabled: (editor) => editor.can().toggleHeading({ level: 1 }),
    active: (editor) => editor.isActive("heading", { level: 1 }),
  },
  {
    id: "h2",
    title: "Titre 2",
    toolbarLabel: "H2",
    ribbonIcon: "H2",
    supported: true,
    execute: (editor) =>
      editor.chain().focus().toggleHeading({ level: 2 }).run(),
    enabled: (editor) => editor.can().toggleHeading({ level: 2 }),
    active: (editor) => editor.isActive("heading", { level: 2 }),
  },
  {
    id: "h3",
    title: "Titre 3",
    ribbonIcon: "H3",
    supported: true,
    execute: (editor) =>
      editor.chain().focus().toggleHeading({ level: 3 }).run(),
    enabled: (editor) => editor.can().toggleHeading({ level: 3 }),
    active: (editor) => editor.isActive("heading", { level: 3 }),
  },
  {
    id: "bullet",
    title: "Liste",
    toolbarLabel: "•",
    ribbonIcon: "•",
    supported: true,
    execute: (editor) => editor.chain().focus().toggleBulletList().run(),
    enabled: (editor) => editor.can().toggleBulletList(),
    active: (editor) => editor.isActive("bulletList"),
  },
  {
    id: "ordered",
    title: "Numérotation",
    toolbarLabel: "1.",
    ribbonIcon: "1.",
    supported: true,
    execute: (editor) => editor.chain().focus().toggleOrderedList().run(),
    enabled: (editor) => editor.can().toggleOrderedList(),
    active: (editor) => editor.isActive("orderedList"),
  },
  {
    id: "quote",
    title: "Citation",
    toolbarLabel: "❝",
    ribbonIcon: "❝",
    supported: true,
    execute: (editor) => editor.chain().focus().toggleBlockquote().run(),
    enabled: (editor) => editor.can().toggleBlockquote(),
    active: (editor) => editor.isActive("blockquote"),
  },
  unsupportedCommand({
    id: "link",
    title: "Lien non disponible",
    ribbonIcon: "🔗",
  }),
  unsupportedCommand({
    id: "image",
    title: "Image non disponible",
    ribbonIcon: "🖼",
  }),
  unsupportedCommand({
    id: "table",
    title: "Tableau non disponible",
    ribbonIcon: "▦",
  }),
  unsupportedCommand({
    id: "ai",
    title: "Assistant IA non disponible",
    ribbonIcon: "✨",
  }),
];

export function getEditorCommand(id) {
  return editorCommands.find((command) => command.id === id) || null;
}

export function getEditorCommands(ids) {
  return ids.map(getEditorCommand).filter(Boolean);
}

export function executeEditorCommand(id, editor) {
  const command = getEditorCommand(id);

  if (!command?.supported || !editor || !command.enabled(editor)) {
    return false;
  }

  return command.execute(editor);
}

export function getEditorCommandState(id, editor) {
  const command = getEditorCommand(id);

  if (!command?.supported || !editor) {
    return {
      active: false,
      enabled: false,
    };
  }

  return {
    active: command.active(editor),
    enabled: command.enabled(editor),
  };
}
