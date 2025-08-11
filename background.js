// Bridge para abrir página de opções via mensagens e garantir popup funcional
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.type === 'OPEN_OPTIONS') {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
      sendResponse({ ok: true });
    } else {
      sendResponse({ ok: false, error: 'openOptionsPage not available' });
    }
  }
});

// Fallback: se não houver popup definido, abrir opções ao clicar no ícone
try {
  chrome.action.onClicked.addListener(() => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    }
  });
} catch (e) {
  // ignore
}


