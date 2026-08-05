import {
  RibbonGroup
} from "./RibbonGroup";

export function Ribbon() {

  return `

<div class="editor-ribbon">

    ${RibbonGroup(
      "Historique",
      [
        {
          id: "undo",
          icon: "↶",
          title: "Annuler"
        },
        {
          id: "redo",
          icon: "↷",
          title: "Rétablir"
        }
      ]
    )}

    ${RibbonGroup(
      "Texte",
      [
        {
          id: "bold",
          icon: "<b>B</b>",
          title: "Gras"
        },
        {
          id: "italic",
          icon: "<i>I</i>",
          title: "Italique"
        },
        {
          id: "underline",
          icon: "<u>U</u>",
          title: "Souligné"
        },
        {
          id: "strike",
          icon: "<s>S</s>",
          title: "Barré"
        }
      ]
    )}

    ${RibbonGroup(
      "Structure",
      [
        {
          id: "h1",
          icon: "H1",
          title: "Titre 1"
        },
        {
          id: "h2",
          icon: "H2",
          title: "Titre 2"
        },
        {
          id: "h3",
          icon: "H3",
          title: "Titre 3"
        }
      ]
    )}

    ${RibbonGroup(
      "Listes",
      [
        {
          id: "bullet",
          icon: "•",
          title: "Liste"
        },
        {
          id: "ordered",
          icon: "1.",
          title: "Numérotation"
        },
        {
          id: "quote",
          icon: "❝",
          title: "Citation"
        }
      ]
    )}

    ${RibbonGroup(
      "Insertion",
      [
        {
          id: "link",
          icon: "🔗",
          title: "Lien"
        },
        {
          id: "image",
          icon: "🖼",
          title: "Image"
        },
        {
          id: "table",
          icon: "▦",
          title: "Tableau"
        }
      ]
    )}

    ${RibbonGroup(
      "IA",
      [
        {
          id: "ai",
          icon: "✨",
          title: "Assistant IA"
        }
      ]
    )}

</div>

`;

}