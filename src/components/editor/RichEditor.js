import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";

let editor = null;

/**
 * Création de l'éditeur Tiptap.
 */
export function createEditor({ element, content = "", onUpdate = null }) {
  if (!element) {
    throw new Error("RichEditor : élément DOM introuvable.");
  }

  destroyEditor();

  editor = new Editor({
    element,

    extensions: [StarterKit, Underline],

    content,

    autofocus: false,

    editorProps: {
      attributes: {
        class: "tiptap-editor",

        spellcheck: "true",
      },
    },

    onCreate() {
      refreshToolbar();
    },

    onUpdate({ editor }) {
      if (typeof onUpdate === "function") {
        onUpdate(editor.getHTML());
      }

      refreshToolbar();
    },

    onSelectionUpdate() {
      refreshToolbar();
    },

    onTransaction() {
      refreshToolbar();
    },
  });

  return editor;
}

/**
 * Retourne l'éditeur.
 */
export function getEditor() {
  return editor;
}

/**
 * Retourne le HTML.
 */
export function getHTML() {
  if (!editor) {
    return "";
  }

  return editor.getHTML();
}

/**
 * Retourne le texte brut.
 */
export function getText() {
  if (!editor) {
    return "";
  }

  return editor.getText();
}

/**
 * Remplace le contenu.
 */
export function setContent(content = "") {
  if (!editor) return;

  editor.commands.setContent(content, {
    emitUpdate: false,
  });

  refreshToolbar();
}

/**
 * Donne le focus.
 */
export function focusEditor() {
  if (!editor) return;

  editor.commands.focus();
}

/**
 * Exécute une commande du ribbon sur l'éditeur courant.
 */
export function execute(command) {
  if (!editor) return;

  const commands = {
    undo: () => editor.chain().focus().undo().run(),
    redo: () => editor.chain().focus().redo().run(),
    bold: () => editor.chain().focus().toggleBold().run(),
    italic: () => editor.chain().focus().toggleItalic().run(),
    underline: () => editor.chain().focus().toggleUnderline().run(),
    strike: () => editor.chain().focus().toggleStrike().run(),
    h1: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    h2: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    h3: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    bullet: () => editor.chain().focus().toggleBulletList().run(),
    ordered: () => editor.chain().focus().toggleOrderedList().run(),
    quote: () => editor.chain().focus().toggleBlockquote().run(),
  };

  commands[command]?.();
}

/**
 * Rafraîchit la Toolbar.
 */
export function refreshToolbar() {
  document.dispatchEvent(new CustomEvent("editor:refresh"));
}

/**
 * Détruit l'éditeur.
 */
export function destroyEditor() {
  if (!editor) return;

  editor.destroy();

  editor = null;
}
