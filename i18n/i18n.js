const detectLanguage = () => {
    var storedLanguage = localStorage.getItem('language');
    if (storedLanguage) {
        return storedLanguage;
    }

    var navigatorLanguage = navigator.languages ? navigator.languages[0] : navigator.language; // fallback to language if languages does not exist
    return navigatorLanguage.substr(0, 2);
}

const load_language = (lang) => {
    return fetch('/i18n/' + lang + '.json').then(r => {
        if (r.ok)
            return r.json();
        throw new Error("Couldn't load language!");
    });
}

const changeLanguage = (lang) => {
    localStorage.setItem('language', lang)
    updateI18N();
}

const i18nUpdateListeners = [];

const addI18nUpdateListener = (listener) => {
    i18nUpdateListeners.push(listener);
}

const removeI18nUpdateListener = (listener) => {
    const index = i18nUpdateListeners.indexOf(listener);
    if (index >= 0)
        i18nUpdateListeners.splice(index, 1);
}

// there must be an element in the dom that contains this string with a special id
// normally at the end (i18n strings for js)
const getStringForJs = (name) => {
    return document.getElementById('i18n-' + name).innerHTML;
}

const updateI18N = () => {
    var language = detectLanguage();
    document.documentElement.lang = language;
    load_language('en').then(defaultLanguage => {
        load_language(language).then(languageDict => Object.assign({}, defaultLanguage, languageDict)).then(languageDict => {
            console.log(`loaded language '${language}':`, languageDict);
            const elements = document.querySelectorAll('[data-i18n]');
            elements.forEach(element => {
                const text = element.dataset.i18n.split('.').reduce((obj, i) => obj[i], languageDict);
                if (text)
                    element.innerHTML = text;
            });
            i18nUpdateListeners.forEach(listener => listener());
        });
    });
}
updateI18N();