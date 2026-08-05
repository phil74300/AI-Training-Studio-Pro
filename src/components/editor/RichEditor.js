import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";

let editor = null;

/**
 * Création de l'éditeur Tiptap.
 */
export function createEditor({
  element,
  content = "",
  onUpdate = null
}) {

  if (!element) {
    throw new Error("RichEditor : élément DOM introuvable.");
  }

  destroyEditor();

  editor = new Editor({

    element,

    extensions: [
      StarterKit
    ],

    content,

    autofocus: false,

    editorProps: {
      attributes: {
        class: "tiptap-editor",
        spellcheck: "true"
      }
    },

    onUpdate({ editor }) {

      if (typeof onUpdate === "function") {
        onUpdate(editor.getHTML());
      }

    }

  });

  return editor;

}

/**
 * Retourne l'instance.
 */
export function getEditor() {
  return editor;
}

/**
 * Retourne le HTML.
 */
export function getHTML() {
  return editor ? editor.getHTML() : "";
}

/**
 * Retourne le texte brut.
 */
export function getText() {
  return editor ? editor.getText() : "";
}

/**
 * Remplace le contenu.
 */
export function setContent(content = "") {

  if (!editor) return;

  editor.commands.setContent(content, {
    emitUpdate: false
  });

}

/**
 * Focus.
 */
export function focusEditor() {

  if (editor) {
    editor.commands.focus();
  }

}

/**
 * Destruction.
 */
export function destroyEditor() {

  if (!editor) return;

  editor.destroy();
  editor = null;

}