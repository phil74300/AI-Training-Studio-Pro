export function Header(title = "Dashboard") {
  return `
    <header class="header">
      <div>
        <h1>${title}</h1>
        <p>AI Training Studio v0.3</p>
      </div>

      <div class="user-info">
        👤 Philippe
      </div>
    </header>
  `;
}