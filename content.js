// let targetLanguage = 'as';

// chrome.storage.sync.get(['targetLanguage'], function(result) {
//   if (result.targetLanguage) {
//     targetLanguage = result.targetLanguage;
//   }
// });

// chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
//   if (request.action === "updateLanguage") {
//     targetLanguage = request.language;
//   }
// });

// async function translateText(text, targetLang) {
//   try {
//     // Using a proxy to avoid CORS issues
//     // const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
//     const googleTranslateUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    
//     // const response = await fetch(proxyUrl + googleTranslateUrl);
//     const response = await fetch(googleTranslateUrl);
//     const data = await response.json();
    
//     // Google Translate returns an array of arrays, where the first element
//     // of each inner array is the translated text
//     let translatedText = '';
//     data[0].forEach(item => {
//       if (item[0]) translatedText += item[0];
//     });
    
//     return translatedText;
//   } catch (error) {
//     console.error('Translation error:', error);
//     return 'Translation failed. Please try again.';
//   }
// }

// function addTranslationButtons() {
//   const messages = document.querySelectorAll('[data-pre-plain-text]');
  
//   messages.forEach(message => {
//     if (!message.querySelector('.whatsapp-translate-btn')) {
//       const translateBtn = document.createElement('button');
//       translateBtn.className = 'whatsapp-translate-btn';
//       translateBtn.textContent = 'Translate';
//       translateBtn.onclick = async function() {
//         const originalText = message.querySelector('.translated-text')?.dataset?.original || message.textContent;
//         translateBtn.textContent = 'Translating...';
//         translateBtn.disabled = true;
        
//         const translatedText = await translateText(originalText, targetLanguage);
        
//         let translationDiv = message.querySelector('.translated-text');
//         if (!translationDiv) {
//           translationDiv = document.createElement('div');
//           translationDiv.className = 'translated-text';
//           message.appendChild(translationDiv);
//         }
//         translationDiv.dataset.original = originalText;
//         translationDiv.textContent = translatedText;
        
//         translateBtn.textContent = 'Translate';
//         translateBtn.disabled = false;
//       };
//       message.appendChild(translateBtn);
//     }
//   });
// }

// function modifyInputField() {
//   const inputField = document.querySelector('div[contenteditable="true"]');
//   if (inputField && !inputField.parentElement.querySelector('.whatsapp-translate-btn')) {
//     const translateBtn = document.createElement('button');
//     translateBtn.className = 'whatsapp-translate-btn';
//     translateBtn.textContent = 'Translate Before Send';
//     translateBtn.style.position = 'absolute';
//     translateBtn.style.bottom = '100%';
//     translateBtn.style.left = '0';
    
//     translateBtn.onclick = async function() {
//       const originalText = inputField.textContent;
//       translateBtn.textContent = 'Translating...';
//       translateBtn.disabled = true;
      
//       const translatedText = await translateText(originalText, targetLanguage);
//       inputField.textContent = translatedText;
      
//       translateBtn.textContent = 'Translate Before Send';
//       translateBtn.disabled = false;
//     };
    
//     inputField.parentElement.style.position = 'relative';
//     inputField.parentElement.appendChild(translateBtn);
//   }
// }

// // Add an error display function
// function showErrorMessage(message) {
//   const errorDiv = document.createElement('div');
//   errorDiv.className = 'whatsapp-translate-error';
//   errorDiv.textContent = message;
//   document.body.appendChild(errorDiv);
//   setTimeout(() => errorDiv.remove(), 3000);
// }

// setInterval(addTranslationButtons, 1000);
// setInterval(modifyInputField, 1000);










let targetLanguage = 'as';
console.log('Initial target language:', targetLanguage);

chrome.storage.sync.get(['targetLanguage'], function(result) {
  if (result.targetLanguage) {
    targetLanguage = result.targetLanguage;
    console.log('Updated target language from storage:', targetLanguage);
  }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "updateLanguage") {
    targetLanguage = request.language;
    console.log('Language updated via message:', targetLanguage);
  }
});

async function translateText(text, targetLang) {
  try {
    console.log(`Attempting to translate to ${targetLang}:`, text);
    const googleTranslateUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    
    console.log('Translation URL:', googleTranslateUrl);
    const response = await fetch(googleTranslateUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data || !data[0]) {
      throw new Error('Invalid response structure from translation service');
    }
    
    let translatedText = '';
    data[0].forEach(item => {
      if (item[0]) translatedText += item[0];
    });
    
    console.log('Translation successful:', translatedText);
    return translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    showErrorMessage(`Translation failed: ${error.message}`);
    return 'Translation failed. Please try again.';
  }
}

function addTranslationButtons() {
  const messages = document.querySelectorAll('[data-pre-plain-text]');
  
  messages.forEach(message => {
    if (!message.querySelector('.whatsapp-translate-btn')) {
      const translateBtn = document.createElement('button');
      translateBtn.className = 'whatsapp-translate-btn';
      translateBtn.textContent = `Translate to ${targetLanguage}`;
      translateBtn.onclick = async function() {
        const originalText = message.querySelector('.translated-text')?.dataset?.original || message.textContent;
        translateBtn.textContent = `Translating to ${targetLanguage}...`;
        translateBtn.disabled = true;
        
        try {
          const translatedText = await translateText(originalText, targetLanguage);
          
          let translationDiv = message.querySelector('.translated-text');
          if (!translationDiv) {
            translationDiv = document.createElement('div');
            translationDiv.className = 'translated-text';
            message.appendChild(translationDiv);
          }
          translationDiv.dataset.original = originalText;
          translationDiv.textContent = translatedText;
        } catch (error) {
          console.error('Button click error:', error);
          showErrorMessage('Translation failed. Please try again.');
        } finally {
          translateBtn.textContent = `Translate to ${targetLanguage}`;
          translateBtn.disabled = false;
        }
      };
      message.appendChild(translateBtn);
    }
  });
}

function modifyInputField() {
  const inputField = document.querySelector('div[contenteditable="true"]');
  if (inputField && !inputField.parentElement.querySelector('.whatsapp-translate-btn')) {
    const translateBtn = document.createElement('button');
    translateBtn.className = 'whatsapp-translate-btn';
    translateBtn.textContent = `Translate to ${targetLanguage}`;
    translateBtn.style.position = 'absolute';
    translateBtn.style.bottom = '100%';
    translateBtn.style.left = '0';
    
    translateBtn.onclick = async function() {
      const originalText = inputField.textContent;
      translateBtn.textContent = `Translating to ${targetLanguage}...`;
      translateBtn.disabled = true;
      
      try {
        const translatedText = await translateText(originalText, targetLanguage);
        inputField.textContent = translatedText;
      } catch (error) {
        console.error('Input field translation error:', error);
        showErrorMessage('Translation failed. Please try again.');
      } finally {
        translateBtn.textContent = `Translate to ${targetLanguage}`;
        translateBtn.disabled = false;
      }
    };
    
    inputField.parentElement.style.position = 'relative';
    inputField.parentElement.appendChild(translateBtn);
  }
}

function showErrorMessage(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'whatsapp-translate-error';
  errorDiv.textContent = message;
  document.body.appendChild(errorDiv);
  setTimeout(() => errorDiv.remove(), 3000);
}

// Start the intervals and log their IDs for debugging
const buttonInterval = setInterval(addTranslationButtons, 1000);
const inputInterval = setInterval(modifyInputField, 1000);
console.log('Button interval ID:', buttonInterval);
console.log('Input interval ID:', inputInterval);