/**
 * ###### CONFIGURATION - KONFIGURACE
 * Pokud změníte názvy sloupců v CSV souboru, upravte názvy zde!
 * Například pokud přejmenujete "photo_url" na "image", změňte photo: 'image'
 */
const CONFIG = {
    // Názvy sloupců v CSV souboru (musí přesně odpovídat hlavičce!)
    fields: {
       ID: 'ID',
        Subjekt: 'Subjekt',
        Rozpouštědlo: 'Rozpouštědlo',
        Barva_kytky: 'Barva kytky',
        Lokalita: 'Lokalita',
        Doba_extrakce: 'Doba extrakce',
        Barva_papírku: 'Barva papírku',
        pH: 'pH',
        Barva_extraktu: 'Barva extraktu',
        
    
    // ###### DATA SOURCE - Cesta k datům (pokud přejmenujete soubor, změňte zde)
    dataUrl: 'data.csv',
    
    // ###### PLACEHOLDER TEXT - Text, když chybí fotografie
    noPhotoText: '📷'
};

/**
 * ###### CSV PARSER - Funkce pro zpracování CSV
 * Tato funkce převede text CSV na pole objektů (záznamů)
 */
function parseCSV(csvText) {
    // Rozdělíme text na řádky (každý řádek = jeden vzorek)
    const lines = csvText.trim().split('\n');
    
    // První řádek jsou názvy sloupců (header)
    const headers = lines[0].split(',').map(h => h.trim());
    
    // ###### FIELD MAPPING - Zde se přiřazují data podle názvů sloupců
    // Pokud chcete přidat nový sloupec, přidejte ho do CONFIG.fields výše
    const result = [];
    
    for (let i = 1; i < lines.length; i++) {
        // Přeskočíme prázdné řádky
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(',');
        const record = {};
        
        // Naplníme objekt daty podle názvů sloupců
        headers.forEach((header, index) => {
            record[header] = values[index] ? values[index].trim() : '';
        });
        
        result.push(record);
    }
    
    return result;
}

/**
 * ###### CREATE CARD - Vytvoří HTML pro jednu kartu
 * Zde můžete měnit strukturu karty (přidat nové elementy, změnit pořadí)
 */
function createCard(sample) {
    // Získáme data podle konfigurace nahoře
    const id = sample[CONFIG.fields.ID] || '';
    const team = sample[CONFIG.fields.Subjekt] || 'unknown';
    const name = sample[CONFIG.fields.name] || 'Unnamed Sample';
    const description = sample[CONFIG.fields.description] || '';
    const location = sample[CONFIG.fields.location] || '';
    const photoUrl = sample[CONFIG.fields.photo];
    const commentary = sample[CONFIG.fields.commentary] || 'No results recorded.';
    
    // ###### PHOTO HANDLING - Zpracování chybějící fotografie
    // Pokud photoUrl existuje a není prázdný, použijeme img tag, jinak placeholder
    let imageHtml;
    if (photoUrl && photoUrl.trim() !== '') {
        // ###### IMAGE SIZE - Zde můžete změnit velikost obrázku (width/height)
        imageHtml = `<img src="${photoUrl}" alt="${name}" class="card-image" loading="lazy">`;
    } else {
        // Placeholder s prvním písmenem názvu vzorku
        const initial = name.charAt(0).toUpperCase();
        imageHtml = `
            <div class="image-placeholder">
                <span>${CONFIG.noPhotoText} ${initial}</span>
            </div>
        `;
    }
    
    // ###### TEAM CLASS - Přidáme třídu podle týmu pro případné barevné rozlišení
    const teamClass = `team-${team.toLowerCase().replace(/\s+/g, '_')}`;
    
    // Vytvoříme HTML strukturu karty
    // ###### CARD STRUCTURE - Zde měňte HTML strukturu karty (pořadí prvků)
    return `
        <article class="sample-card ${teamClass}" data-id="${id}" data-team="${team}">
            <div class="card-image-container">
                ${imageHtml}
            </div>
            <div class="card-content">
                <span class="team-badge">${team}</span>
                <h2 class="card-title">${name}</h2>
                <p class="card-location">📍 ${location}</p>
                <p class="card-description">${description}</p>
                <div class="result-box">
                    <div class="result-label">Results</div>
                    <div class="result-text">${commentary}</div>
                </div>
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
    const error = document.getElementById('error');
    
    // ###### FILTERING - Zde můžete přidat filtrování (např. pouze vlastní tým)
    // Příklad: const filtered = data.filter(item => item.team === 'team_a');
    const filtered = data; // Zatím zobrazujeme vše
    
    if (filtered.length === 0) {
        gallery.innerHTML = '<p class="status-message">No samples found.</p>';
        loading.style.display = 'none';
        return;
    }
    
    // ###### SORTING - Zde můžete přidat řazení (např. podle názvu)
    // filtered.sort((a, b) => a.name.localeCompare(b.name));
    
    // Vygenerujeme HTML pro všechny karty a vložíme do galerie
    const cardsHtml = filtered.map(sample => createCard(sample)).join('');
    gallery.innerHTML = cardsHtml;
    
    // Skryjeme loading zprávu
    loading.style.display = 'none';
}

/**
 * ###### LOAD DATA - Načte data ze souboru
 */
async function loadData() {
    try {
        const response = await fetch(CONFIG.dataUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const csvText = await response.text();
        const data = parseCSV(csvText);
        
        console.log('###### DEBUG - Načteno vzorků:', data.length); // Zobrazí v konzoli počet vzorků
        console.log('První vzorek:', data[0]); // Zobrazí strukturu prvního vzorku pro kontrolu
        
        renderGallery(data);
        
    } catch (error) {
        console.error('###### ERROR - Chyba při načítání dat:', error);
        document.getElementById('loading').style.display = 'none';
        document.getElementById('error').style.display = 'block';
    }
}

/**
 * ###### INIT - Spuštění aplikace po načtení stránky
 */
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    
    // ###### CONSOLE TIP - Tip pro studenty do konzole (F12)
    console.log('💡 TIP: Otevřete tento soubor v editoru a zkuste změnit CONFIG.fields výše!');
    console.log('💡 TIP: Zkuste v CSS změnit --primary-color na jinou barvu!');
});
