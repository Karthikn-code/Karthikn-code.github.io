const https = require('https');
const username = 'Karthikn-code';
const options = {
    headers: { 'User-Agent': 'Node Script' }
};

https.get(`https://api.github.com/users/${username}/repos`, options, (res) => {
    let raw = '';
    res.on('data', chunk => raw += chunk);
    res.on('end', () => {
        let repos;
        try { repos = JSON.parse(raw); } catch (e) { return console.log(e); }
        if (!Array.isArray(repos)) return console.log("Rate limited or not array", raw);
        
        const languageBytes = {};
        let totalBytes = 0;
        let pending = repos.length;
        if(pending === 0) return console.log("No repos");

        repos.forEach(repo => {
            https.get(repo.languages_url, options, (res2) => {
                let raw2 = '';
                res2.on('data', chunk => raw2 += chunk);
                res2.on('end', () => {
                    let langs;
                    try { langs = JSON.parse(raw2); } catch(e) {}
                    if (langs) {
                        for (const [lang, bytes] of Object.entries(langs)) {
                            if (typeof bytes === 'number' && lang.toLowerCase() !== 'message') {
                                languageBytes[lang] = (languageBytes[lang] || 0) + bytes;
                                totalBytes += bytes;
                            }
                        }
                    }
                    pending--;
                    if (pending === 0) {
                        if(totalBytes === 0) return console.log("0 bytes");
                        const percentages = Object.entries(languageBytes)
                            .map(([name, bytes]) => ({ name, percentage: Math.round((bytes/totalBytes)*100) }))
                            .filter(s => s.percentage > 0)
                            .sort((a,b) => b.percentage - a.percentage)
                            .slice(0, 6);
                        console.log(JSON.stringify(percentages, null, 2));
                    }
                });
            });
        });
    });
});
