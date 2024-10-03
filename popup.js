document.getElementById('saveSettings').addEventListener('click', function() {
    const targetLang = document.getElementById('targetLang').value;
    chrome.storage.sync.set({
      targetLanguage: targetLang
    }, function() {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "updateLanguage", language: targetLang});
      });
    });
  });