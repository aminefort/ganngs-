let localeData = {}

function locale(page, key) {
    if (localeData[page]?.[key] != undefined) return localeData[page]?.[key];
    else {
        const promise = new Promise((resolve) => {
            const interval = setInterval(() => {
                if (localeData[page]?.[key] != undefined) {
                    clearInterval(interval);
                    resolve(localeData[page]?.[key])
                };
            }, 300);
        });

        return promise;
    }
}

window.addEventListener("message", (event) => {
    if (event.data.type == "loadLocale") {
        localeData = event.data.data;
    }
});

export default locale;