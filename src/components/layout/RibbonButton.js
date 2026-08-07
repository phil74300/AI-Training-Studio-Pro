export function RibbonButton(button) {
  return `

<button

    id="ribbon-${button.id}"

    class="ribbon-button"

    title="${button.title}"

    data-command="${button.id}"

    ${button.supported ? "" : "disabled"}

>

    <span class="ribbon-icon">

        ${button.ribbonIcon}

    </span>

</button>

`;
}

/**
 * Active visuellement un bouton.
 */
export function setRibbonButtonActive(id, active = true) {
  const button = document.getElementById(`ribbon-${id}`);

  if (!button) return;

  button.classList.toggle("active", active);
}

/**
 * Active / désactive un bouton.
 */
export function setRibbonButtonEnabled(id, enabled = true) {
  const button = document.getElementById(`ribbon-${id}`);

  if (!button) return;

  button.disabled = !enabled;
}

/**
 * Écoute le clic.
 */
export function bindRibbonButton(id, callback) {
  const button = document.getElementById(`ribbon-${id}`);

  if (!button) return;

  button.onclick = callback;
}
