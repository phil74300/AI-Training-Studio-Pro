import { Header } from "../components/Header";

export function Dashboard() {
  return `
    <main class="content">

      ${Header("Dashboard")}

      <p class="subtitle">
        Bienvenue dans AI Training Studio.
      </p>

      <div class="cards">

        <div class="card">
          <h3>📁 Projets</h3>
          <span id="projectCount">0</span>
          <p>Projet(s) enregistré(s)</p>
        </div>

        <div class="card">
          <h3>📚 Livres</h3>
          <span>0</span>
          <p>Documents générés</p>
        </div>

        <div class="card">
          <h3>🤖 IA</h3>
          <span>●</span>
          <p>Prête à être connectée</p>
        </div>

        <div class="card">
          <h3>📄 Exports</h3>
          <span>0</span>
          <p>PDF / DOCX / SCORM</p>
        </div>

      </div>

      <section class="dashboard-section">

        <h2>📅 Activité récente</h2>

        <div class="activity-box">

          Aucun projet créé pour le moment.

        </div>

      </section>

    </main>
  `;
}