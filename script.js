/**
 * ###### CONFIGURATION - KONFIGURACE
 * Pokud změníte názvy sloupců v CSV souboru, upravte názvy zde!
 * Například pokud přejmenujete "Subjekt" na "Team", změňte Subjekt: 'Team'
 */
const CONFIG = {
    // Názvy sloupců v CSV souboru (musí přesně odpovídat hlavičce v data.csv!)
    fields: {
        ID: 'ID',
        Subjekt: 'Subjekt',
        Rozpouštědlo: 'Rozpouštědlo',
        Barva_kytky: 'Barva kytky',
        Lokalita: 'Lokalita',
        Doba_extrakce: 'Doba extrakce',
        Barva_papirku: 'Barva papírku',
        pH: 'pH',
        Barva_extraktu: 'Barva extraktu',
        // Pokud máš v CSV sloupec pro obrázek, přidej ho sem, např:
        // Foto: 'Foto URL'
    }, // <-- TADY CHYBĚLA TATO ZÁVORKA!

    // ###### DATA SOURCE - Cesta k datům
    dataUrl: 'data.csv',
    
    // ###### PLACEHOLDER TEXT - Text, když chybí fotografie
    noPhotoText: '⚗️' // Změnil jsem na křivuli, hodí se k chemii :)
};

/**
 * ###### CSV PARSER - Funkce pro zpracování CSV
 */
function parseCSV(csvText) {
    // Rozdělíme text na řádky a odstraníme prázdné řádky na začátku/konci
    const lines = csvText.trim().split('\n');
    
    if (lines.length < 2) return []; // Žádná data nebo jen hlavička

    // První řádek jsou názvy sloupců (header)
    const headers = lines[0].split(',').map(h => h.trim());
    
    const result = [];
    
    for (let i = 1; i < lines.length; i++) {
        // Přeskočíme prázdné řádky uvnitř souboru
        if (!lines[i].trim()) continue;
        
        // Jednoduché rozdělení čárkou (pozor na čárky v textu buněk!)
        const values = lines[i].split(',');
        const record = {};
        
        // Naplníme objekt daty
        headers.forEach((header, index) => {
            // Přiřadíme hodnotu k hlavičce, pokud hodnota neexistuje, dáme prázdný řetězec
            record[header] = values[index] ? values[index].trim() : '';
        });
        
        result.push(record);
    }
    
    return result;
}

/**
 * ###### CREATE CARD - Vytvoří HTML pro jednu kartu
 * OPRAVENO: Nyní používá pole definovaná v CONFIG.fields
 */
function createCard(sample) {
    // Získáme data PODLE NÁZVŮ definovaných v CONFIG.fields
    const id = sample[CONFIG.fields.ID] || 'No ID';
    const subjekt = sample[CONFIG.fields.Subjekt] || 'Neznámý';
    
    // Protože v původním CONFIG chybělo 'name', použijeme jako název Barvu kytky + Rozpouštědlo
    const kytka = sample[CONFIG.fields.Barva_kytky] || 'Neznámá rostlina';
    const rozpoustedlo = sample[CONFIG.fields.Rozpouštědlo] || '?';
    const cardTitle = `${kytka} v ${rozpoustedlo}`;

    const lokalita = sample[CONFIG.fields.Lokalita] || 'Neznámá lokalita';
    const ph = sample[CONFIG.fields.pH] || '?';
    const extrakce = sample[CONFIG.fields.Doba_extrakce] || '?';
    const barvaExtraktu = sample[CONFIG.fields.Barva_extraktu] || 'neznámá';
    
    // V tvém CONFIG chybělo pole pro fotku, definuji ho zde lokálně pro ukázku.
    // Pokud chceš fotky, přidej sloupec 'Foto' do CSV a do CONFIG.fields.
    const photoUrl = sample['Foto']; 

    // ###### PHOTO HANDLING
    let imageHtml;
    if (photoUrl && photoUrl.trim() !== '') {
        imageHtml = `<img src="${photoUrl}" alt="${cardTitle}" class="card-image" loading="lazy">`;
    } else {
        // Placeholder s ikonou
        imageHtml = `
            <div class="image-placeholder">
                <span>${CONFIG.noPhotoText}</span>
            </div>
        `;
    }
    
    // ###### TEAM CLASS
    const subjektClass = `team-${subjekt.toLowerCase().replace(/\s+/g, '_')}`;
    
    // ###### CARD STRUCTURE - Upravená struktura pro zobrazení chemických dat
    return `
        <article class="sample-card ${subjektClass}" data-id="${id}">
            <div class="card-image-container">
                ${imageHtml}
            </div>
            <div class="card-content">
                <span class="team-badge">${subjekt}</span>
                <h2 class="card-title">${cardTitle}</h2>
                <p class="card-metadata">📍 <b>Lokalita:</b> ${lokalita}</p>
                <p class="card-metadata">⏱️ <b>Doba extrakce:</b> ${extrakce}</p>
                
                <div class="result-box">
                    <div class="result-label">Výsledky analýzy</div>
                    <div class="result-grid">
                        <div class="result-item"><strong>pH:</strong> ${ph}</div>
                        <div class="result-item"><strong>Barva:</strong> ${barvaExtraktu}</div>
                    </div>
                </div>
                <small class="sample-id">ID: ${id}</small>
            </div>
        </article>
    `;
}

/**
 * ###### RENDER - Zobrazí všechny karty v galerii
 */
function renderGallery(data) {
    const gallery = document.getElementById('gallery');
    const loading = document.getElementById('loading');
    
    if (!gallery) {
        console.error("Chyba: V HTML chybí element s id='gallery'!");
        return;
    }

    const filtered = data; // Zatím zobrazujeme vše
    
    if (filtered.length === 0) {
        gallery.innerHTML = '<p class="status-message">Nebyla nalezena žádná data. Zkontrolujte data.csv.</p>';
        if (loading) loading.style.display = 'none';
        return;
    }
    
    // Vygenerujeme HTML pro všechny karty a vložíme do galerie
    const cardsHtml = filtered.map(sample => createCard(sample)).join('');
    gallery.innerHTML = cardsHtml;
    
    // Skryjeme loading zprávu
    if (loading) loading.style.display = 'none';
}

/**
 * ###### LOAD DATA - Načte data ze souboru
 */
async function loadData() {
    const loading = document.getElementById('loading');
    const errorEl = document.getElementById('error');

    try {
        const response = await fetch(CONFIG.dataUrl);
        
        if (!response.ok) {
            throw new Error(`Nepodařilo se načíst soubor ${CONFIG.dataUrl} (Status: ${response.status})`);
        }
        
        const csvText = await response.text();
        const data = parseCSV(csvText);
        
        console.log('###### DEBUG - Načteno vzorků:', data.length);
        if (data.length > 0) console.log('První vzorek pro kontrolu:', data[0]);
        
        renderGallery(data);
        
    } catch (error) {
        console.error('###### ERROR - Chyba:', error);
        if (loading) loading.style.display = 'none';
        if (errorEl) {
            errorEl.style.display = 'block';
            errorEl.innerText = `Chyba při načítání dat: ${error.message}`;
        }
    }
}

/**
 * ###### INIT - Spuštění aplikace po načtení stránky
 */
document.addEventListener('DOMContentLoaded', () => {
    loadData();
});
