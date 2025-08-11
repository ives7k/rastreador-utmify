(function() {
  const displayPrefsKey = 'utmifyDisplayPrefs';

  const el = {
    profit: document.getElementById('pref-profit'),
    cost: document.getElementById('pref-cost'),
    roi: document.getElementById('pref-roi'),
    sales: document.getElementById('pref-sales'),
    selectAll: document.getElementById('select-all'),
    clearAll: document.getElementById('clear-all')
  };

  const defaults = { profit: true, cost: true, roi: true, sales: true };

  function loadPrefs() {
    chrome.storage.local.get([displayPrefsKey], (result) => {
      const prefs = { ...defaults, ...(result[displayPrefsKey] || {}) };
      el.profit.checked = !!prefs.profit;
      el.cost.checked = !!prefs.cost;
      el.roi.checked = !!prefs.roi;
      el.sales.checked = !!prefs.sales;
    });
  }

  function savePrefs(prefs) {
    chrome.storage.local.set({ [displayPrefsKey]: prefs });
  }

  function currentPrefsFromUI() {
    return {
      profit: el.profit.checked,
      cost: el.cost.checked,
      roi: el.roi.checked,
      sales: el.sales.checked,
    };
  }

  el.selectAll.addEventListener('click', () => {
    el.profit.checked = true;
    el.cost.checked = true;
    el.roi.checked = true;
    el.sales.checked = true;
    savePrefs(currentPrefsFromUI());
  });

  el.clearAll.addEventListener('click', () => {
    el.profit.checked = false;
    el.cost.checked = false;
    el.roi.checked = false;
    el.sales.checked = false;
    savePrefs(currentPrefsFromUI());
  });

  // Auto-save on toggle for instant feedback
  [el.profit, el.cost, el.roi, el.sales].forEach((checkbox) => {
    checkbox.addEventListener('change', () => savePrefs(currentPrefsFromUI()));
  });

  loadPrefs();
})();


