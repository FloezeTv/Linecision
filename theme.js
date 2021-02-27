const changeTheme = () => {
    const theme = localStorage.getItem('theme');
    if (theme && theme.toLowerCase() === 'dark') {
        // dark theme was set
        localStorage.setItem('theme', 'light');
    } else {
        // light, no or invalid theme was set
        localStorage.setItem('theme', 'dark');
    }
    updateTheme();
}

const updateTheme = () => {
    const theme = localStorage.getItem('theme');
    if (theme && theme.toLowerCase() === 'dark') {
        // dark theme is set
        document.body.classList.remove('light');
        document.body.classList.add('dark');
    } else {
        // light, no or invalid theme is set
        document.body.classList.remove('dark');
        document.body.classList.add('light');
    }
}

const saveUserTheme = () => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
}

if (!localStorage.getItem('theme'))
    saveUserTheme();