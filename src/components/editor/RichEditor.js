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
    throw new Error(
      "RichEditor : élément DOM introuvable."
    );
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

    onCreate() {

      refreshToolbar();

    },

    onUpdate({ editor }) {

      if (typeof onUpdate === "function") {

        onUpdate(
          editor.getHTML()
        );

      }

      refreshToolbar();

    },

    onSelectionUpdate() {

      refreshToolbar();

    },

    onTransaction() {

      refreshToolbar();

    }

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

  editor.commands.setContent(
    content,
    {
      emitUpdate: false
    }
  );

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
 * Rafraîchit la Toolbar.
 */
export function refreshToolbar() {

  document.dispatchEvent(

    new CustomEvent(
      "editor:refresh"
    )

  );

}

/**
 * Détruit l'éditeur.
 */
export function destroyEditor() {

  if (!editor) return;

  editor.destroy();

  editor = null;

}