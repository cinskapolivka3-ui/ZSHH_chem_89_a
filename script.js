// Globální konfigurace, kterou tvoje funkce createCard vyžaduje
const CONFIG = {
    fields: {
        ID: 'ID',
        Subjekt: 'Subjekt',
        Barva_kytky: 'Barva_kytky',
        Rozpouštědlo: 'Rozpouštědlo',
        Lokalita: 'Lokalita',
        pH: 'pH'
    }
};

// Tvoje původní funkce na vytvoření karty (vzhledově upravená)
function createCard(sample) {
    const id = sample[CONFIG.fields.ID] || '';
    const team = sample[CONFIG.fields.Subjekt] || 'Neznámý tým';
    const kytka = sample[CONFIG.fields.Barva_kytky] || 'neznámá';
    const rozpoustedlo = sample[CONFIG.fields.Rozpouštědlo] || 'neuvedeno';
    const lokalita = sample[CONFIG.fields.Lokalita] || 'neznámá';
    const ph = sample[CONFIG.fields.pH] || '-';

    const teamClass = `team-${team.toLowerCase().replace(/\s+/g, '_')}`;

    return `
        <article class="sample-card ${teamClass}" data-id="${id}">
            <div class="card-banner">
                <div class="card-icon">🧪</div>
            </div>
            <div class="card-content">
                <span class="team-badge">${team}</span>
                
                <h2 class="card-title">${id}</h2>
                
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

// Simple CSV Parser - převede text z data.csv na objekty
function parseCSV(text) {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    if (lines.length < 2) return [];

    // Hlavička CSV (první řádek)
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    
    // Data (ostatní řádky)
    return lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const obj = {};
        headers.forEach((header, index) => {
            obj[header] = values[index] || '';
        });
        return obj;
    });
}

// Načtení dat a skrytí loading zprávy
async function loadData() {
    const loadingEl = document.getElementById('loading');
    const galleryEl = document.getElementById('gallery');
    const errorEl = document.getElementById('error');

    try {
        // Načteme soubor data.csv
        const response = await fetch('data.csv');
        if (!response.ok) throw new Error('Nepodařilo se načíst data.csv');
        
        const csvText = await response.text();
        const samples = parseCSV(csvText);

        // Schováme loading
        loadingEl.style.display = 'none';

        if (samples.length === 0) {
            galleryEl.innerHTML = '<p class="status-message">Žádné vzorky nebyly nalezeny.</p>';
            return;
        }

        // Vykreslíme karty do mřížky
        galleryEl.innerHTML = samples.map(sample => createCard(sample)).join('');

    } catch (error) {
        console.error(error);
        loadingEl.style.display = 'none';
        errorEl.style.display = 'block';
    }
}

// Spustíme načítání po načtení stránky
document.addEventListener('DOMContentLoaded', loadData);
