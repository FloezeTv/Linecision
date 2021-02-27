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
        });
    });
}
updateI18N();