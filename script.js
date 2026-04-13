function createCard(sample) {
    // Načtení dat z CONFIG
    const id = sample[CONFIG.fields.ID] || '';
    const team = sample[CONFIG.fields.Subjekt] || 'Neznámý tým';
    const kytka = sample[CONFIG.fields.Barva_kytky] || 'neznámá';
    const rozpoustedlo = sample[CONFIG.fields.Rozpouštědlo] || 'neuvedeno';
    const lokalita = sample[CONFIG.fields.Lokalita] || 'neznámá';
    const ph = sample[CONFIG.fields.pH] || '-';

    // Třída pro barvení podle týmu
    const teamClass = `team-${team.toLowerCase().replace(/\s+/g, '_')}`;

    return `
        <article class="sample-card ${teamClass}" data-id="${id}">
            <div class="card-content">
                <span class="team-badge">${team}</span>
                
                <h2 class="card-title">Vzorek #${id}</h2>
                
                <div class="info-row">
                    <span class="label">Barva kytky:</span>
                    <span class="value">${kytka}</span>
                </div>
                
                <div class="info-row">
                    <span class="label">Rozpouštědlo:</span>
                    <span class="value">${rozpoustedlo}</span>
                </div>

                <hr>

                <p class="card-location">📍 ${lokalita}</p>
                
                <div class="result-box">
                    <div class="result-label">pH faktoru</div>
                    <div class="result-text">${ph}</div>
                </div>
            </div>
        </article>
    `;
}
