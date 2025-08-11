// Desenvolvido por @ives7k
const budgetStorageKey = 'utmifyBudgetTimestamps';
const displayPrefsKey = 'utmifyDisplayPrefs';

const permanentColor = 'rgb(40, 199, 111)'; // Verde
const flashColor = '#FFD700'; // Amarelo
const noDataColor = '#888'; // Cinza

const saveIconSVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-floppy" viewBox="0 0 16 16">
  <path d="M11 2H9v3h2V2Z"/>
  <path d="M1.5 0h11.586a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 14.5v-13A1.5 1.5 0 0 1 1.5 0ZM1 1.5v13a.5.5 0 0 0 .5.5H2v-4.5A1.5 1.5 0 0 1 3.5 9h9a1.5 1.5 0 0 1 1.5 1.5V15h.5a.5.5 0 0 0 .5-.5V2.914a.5.5 0 0 0-.146-.353l-1.415-1.415A.5.5 0 0 0 13.086 1H13v4.5A1.5 1.5 0 0 1 11.5 7h-7A1.5 1.5 0 0 1 3 5.5V1H1.5a.5.5 0 0 0-.5.5Zm3 0h7a.5.5 0 0 1 .5.5V5h-8V1.5a.5.5 0 0 1 .5-.5Z"/>
</svg>`;

// settings icon removido (não usamos mais botão de engrenagem)

const clockIconSVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="bi bi-clock" viewBox="0 0 16 16" stroke="currentColor" stroke-width="1">
  <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
  <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
</svg>`;

function runTracker() {
    const table = document.querySelector('table');
    if (!table) return;

    chrome.storage.local.get([budgetStorageKey, displayPrefsKey], (result) => {
        if (chrome.runtime.lastError) {
            return;
        }
        const budgetTimestamps = result[budgetStorageKey] || {};
        const displayPrefs = {
            profit: true,
            cost: true,
            roi: true,
            sales: true,
            ...(result[displayPrefsKey] || {})
        };
        const headers = [...table.querySelectorAll('thead th')];
        
        const campaignIndex = headers.findIndex(th => th.innerText.toLowerCase().includes('campanha'));
        const profitIndex = headers.findIndex(th => th.innerText.toLowerCase().includes('lucro'));
        const roiIndex = headers.findIndex(th => th.innerText.toLowerCase().includes('roi'));
        const salesIndex = headers.findIndex(th => th.innerText.toLowerCase().includes('vendas'));
        const costIndex = headers.findIndex(th => th.innerText.toLowerCase().includes('gasto'));

        if (campaignIndex === -1) return;

        const buildDisplayText = (data, prefs) => {
            if (!data || typeof data !== 'object') return '';
            const left = data.time;
            const infoParts = [];
            if (prefs.profit) infoParts.push(`LUCRO: ${data.profit}`);
            if (prefs.cost) infoParts.push(`GASTO: ${data.cost}`);
            if (prefs.roi) infoParts.push(`ROI: ${data.roi}`);
            if (prefs.sales) infoParts.push(`VENDAS: ${data.sales}`);
            const right = infoParts.join(' | ');
            return right ? `${left} - ${right}` : `${left}`;
        };

        table.querySelectorAll('tbody tr').forEach(row => {
            if (row.cells.length <= campaignIndex) return;
            
            const campaignCell = row.cells[campaignIndex];
            const uniqueKey = row.dataset.id;

            if (!uniqueKey || !campaignCell) return;

            let container = campaignCell.querySelector('.timestamp-container');
            let textDisplay;
            let clockIcon;

            if (!container) {
                container = document.createElement('div');
                container.className = 'timestamp-container';
                container.style.cssText = "margin-top: 8px; display: flex; align-items: center; font-size: 12px;";

                const button = document.createElement('button');
                button.className = 'utmify-save-btn';
                button.title = "Marcar horário, lucro, gasto, ROI e vendas da alteração";
                button.innerHTML = saveIconSVG;
                button.style.cssText = `margin-right: 8px; background: none; border: none; cursor: pointer; padding: 4px; line-height: 0; color: #aaa; transition: color 0.2s;`;
                button.onmouseover = () => { button.style.color = permanentColor; };
                button.onmouseout = () => { button.style.color = '#aaa'; };

                const displayWrapper = document.createElement('div');
                displayWrapper.className = 'timestamp-display-wrapper';
                displayWrapper.style.cssText = `display: flex; align-items: center; flex-wrap: wrap; background-color: rgba(255, 255, 255, 0.05); padding: 4px 10px; border-radius: 12px; font-weight: bold;`;

                clockIcon = document.createElement('span');
                clockIcon.innerHTML = clockIconSVG;
                clockIcon.style.cssText = `margin-right: 8px; display: flex; align-items: center; transition: color 0.3s;`;

                textDisplay = document.createElement('span');
                textDisplay.className = 'unified-display';
                textDisplay.style.cssText = "transition: color 0.3s; display: flex; align-items: center;";

                const setDisplayColors = (color) => {
                    textDisplay.style.color = color;
                    clockIcon.style.color = color;
                };

                const savedData = budgetTimestamps[uniqueKey];
                if (savedData && typeof savedData === 'object') {
                    const displayText = buildDisplayText(savedData, displayPrefs);
                    textDisplay.innerText = displayText.toUpperCase();
                    setDisplayColors(permanentColor);
                } else {
                    textDisplay.innerText = 'Nenhuma alteração registrada.';
                    setDisplayColors(noDataColor);
                }

                button.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    const now = new Date();
                    const formattedTime = now.toLocaleTimeString('pt-BR');

                    const currentProfit = (profitIndex > -1 && row.cells[profitIndex]) ? row.cells[profitIndex].innerText : 'N/A';
                    const currentRoi = (roiIndex > -1 && row.cells[roiIndex]) ? row.cells[roiIndex].innerText : 'N/A';
                    const currentSales = (salesIndex > -1 && row.cells[salesIndex]) ? row.cells[salesIndex].innerText : 'N/A';
                    const currentCost = (costIndex > -1 && row.cells[costIndex]) ? row.cells[costIndex].innerText : 'N/A';

                    const dataToSave = {
                        time: formattedTime,
                        profit: currentProfit,
                        roi: currentRoi,
                        sales: currentSales,
                        cost: currentCost
                    };

                    chrome.storage.local.get([budgetStorageKey, displayPrefsKey], (currentResult) => {
                        if (chrome.runtime.lastError) {
                            return;
                        }
                        const currentTimestamps = currentResult[budgetStorageKey] || {};
                        currentTimestamps[uniqueKey] = dataToSave;

                        const currentPrefs = {
                            profit: true,
                            cost: true,
                            roi: true,
                            sales: true,
                            ...(currentResult[displayPrefsKey] || {})
                        };

                        chrome.storage.local.set({ [budgetStorageKey]: currentTimestamps }, () => {
                            if (chrome.runtime.lastError) {
                                return;
                            }
                            const displayText = buildDisplayText(dataToSave, currentPrefs);
                            textDisplay.innerText = displayText.toUpperCase();

                            setDisplayColors(flashColor);

                            setTimeout(() => {
                               setDisplayColors(permanentColor);
                            }, 500);
                        });
                    });
                };

                displayWrapper.appendChild(clockIcon);
                displayWrapper.appendChild(textDisplay);
                container.appendChild(button);
                container.appendChild(displayWrapper);
                campaignCell.appendChild(container);
            } else {
                // Apenas atualizar o texto conforme preferências atuais
                const savedData = budgetTimestamps[uniqueKey];
                textDisplay = container.querySelector('.unified-display');
                clockIcon = container.querySelector('.bi-clock')?.parentElement || container.querySelector('span');
                const setDisplayColors = (color) => {
                    if (textDisplay) textDisplay.style.color = color;
                    if (clockIcon) clockIcon.style.color = color;
                };
                if (savedData && typeof savedData === 'object') {
                    const displayText = buildDisplayText(savedData, displayPrefs);
                    if (textDisplay) textDisplay.innerText = displayText.toUpperCase();
                    setDisplayColors(permanentColor);
                } else {
                    if (textDisplay) textDisplay.innerText = 'Nenhuma alteração registrada.';
                    setDisplayColors(noDataColor);
                }
            }
        });
    });
}

let debounceTimer;
const observer = new MutationObserver(() => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(runTracker, 500);
});

observer.observe(document.body, { childList: true, subtree: true });

setTimeout(runTracker, 1500);

// Reagir às mudanças de preferências para atualizar a exibição em tempo real
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes[displayPrefsKey]) {
        runTracker();
    }
});