const VERSION = 0.1;
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
module.exports = {
    VERSION: VERSION,
    checkForUpdates: async () => {
        const response = await fetch('https://raw.githubusercontent.com/GovnocodedByChapo/dota2-discord-rich-presence/main/version.json')
        const json = await response.json()
        if (json.last != VERSION) {
            let CHANGELOG = null;
            if (json.changelog[json.last]) {
                CHANGELOG = json.changelog[json.last].join('\n\t- ')
            }
            return { last: json.last, changelog: CHANGELOG, url: json.url };
        }
        return false;
    }
};