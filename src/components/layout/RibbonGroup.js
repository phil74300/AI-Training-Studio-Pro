import {
  RibbonButton
} from "./RibbonButton";

export function RibbonGroup(
  title,
  buttons = []
) {

  return `

<div class="ribbon-group">

    <div class="ribbon-buttons">

        ${buttons.map(button =>

            RibbonButton(button)

        ).join("")}

    </div>

    <div class="ribbon-title">

        ${title}

    </div>

</div>

`;

}