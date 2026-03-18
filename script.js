document.addEventListener('DOMContentLoaded', () => {

    /* =========================================
       1. Smooth Scroll
       ========================================= */
    document.querySelectorAll('.nav-links a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    /* =========================================
       2. Scroll Reveal Animations
       ========================================= */
    const revealElements = document.querySelectorAll('.reveal-up');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Optional: Un-observe once revealed for performance
                // observer.unobserve(entry.target); 
            }
        });
    }, {
        root: null,
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // Force run once on load for elements already in viewport
    setTimeout(() => {
        revealElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight) {
                el.classList.add('active');
            }
        });
    }, 100);

    /* =========================================
       3. Spotlight Mouse Hover Effect on Cards
       ========================================= */
    const cards = document.querySelectorAll('.shiny-edge');

    cards.forEach(card => {
        const glow = card.querySelector('.card-glow');
        if (!glow) return;

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Move the glow to follow the mouse
            glow.style.top = `${y}px`;
            glow.style.left = `${x}px`;
        });

        // Mobile fallback
        card.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                const rect = card.getBoundingClientRect();
                const x = e.touches[0].clientX - rect.left;
                const y = e.touches[0].clientY - rect.top;

                glow.style.top = `${y}px`;
                glow.style.left = `${x}px`;
                glow.style.opacity = '1';
            }
        });

        card.addEventListener('touchend', () => {
            glow.style.opacity = '0';
        });
    });

    /* =========================================
       4. Navbar scroll effects & Mobile Menu
       ========================================= */
    const navbar = document.querySelector('.navbar');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = mobileMenuBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.replace('fa-bars', 'fa-times');
            } else {
                icon.classList.replace('fa-times', 'fa-bars');
            }
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileMenuBtn.querySelector('i').classList.replace('fa-times', 'fa-bars');
            });
        });
    }

    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            navbar.style.background = 'rgba(255, 255, 255, 0.85)';
            navbar.style.borderBottom = '1px solid rgba(0, 0, 0, 0.08)';
            navbar.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.03)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.5)';
            navbar.style.borderBottom = '1px solid transparent';
            navbar.style.boxShadow = 'none';
        }
    });

    /* =========================================
       5. Number Counter Animation for Stats
       ========================================= */
    const speed = 200; // The lower the slower

    // Intersection Observer to trigger animation
    const startCounters = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;

                const updateCount = () => {
                    const target = +counter.getAttribute('data-target');
                    const count = +(counter.innerText.replace(/,/g, ''));

                    const inc = target / speed;

                    if (count < target) {
                        counter.innerText = Math.ceil(count + inc).toLocaleString();
                        setTimeout(updateCount, 15);
                    } else {
                        counter.innerText = target.toLocaleString();
                    }
                };

                updateCount();
                observer.unobserve(counter); // Only run once
            }
        });
    };

    const counterObserver = new IntersectionObserver(startCounters, {
        threshold: 0.5,
        rootMargin: "0px"
    });

    /* =========================================
       6. Live GitHub Stats Fetching
       ========================================= */
    async function fetchGitHubStats() {
        const counters = document.querySelectorAll('.counter');
        const username = 'Karthikn-code';

        try {
            // 1. Fetch User Data (Projects count)
            const userRes = await fetch(`https://api.github.com/users/${username}`);
            const userData = await userRes.json();
            const projectsCount = userData.public_repos || 13; // default fallback

            // 2. Fetch Repos sizes and extract technical skills (languages + topics)
            const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`);
            const reposData = await reposRes.json();

            let totalSize = 11000;
            const uniqueLanguages = new Set();
            const uniqueTopics = new Set();

            if (Array.isArray(reposData)) {
                totalSize = reposData.reduce((acc, repo) => acc + (repo.size || 0), 0);

                reposData.forEach(repo => {
                    if (repo.language) {
                        uniqueLanguages.add(repo.language);
                    }
                    if (repo.topics && Array.isArray(repo.topics)) {
                        repo.topics.forEach(topic => uniqueTopics.add(topic));
                    }
                });
            } else {
                uniqueLanguages.add("JavaScript");
                uniqueLanguages.add("HTML");
                uniqueLanguages.add("CSS");
                uniqueLanguages.add("Python");
                uniqueTopics.add("Node.js");
                uniqueTopics.add("Express.js");
                uniqueTopics.add("React.js");
            }

            // 3. Populate dynamic Languages in index.html and about.html
            const indexLangs = document.getElementById('dynamic-languages-index');
            const aboutLangs = document.getElementById('dynamic-languages-about');

            if (uniqueLanguages.size > 0) {
                if (indexLangs) {
                    indexLangs.innerHTML = '';
                    uniqueLanguages.forEach(lang => {
                        const li = document.createElement('li');
                        li.textContent = lang;
                        indexLangs.appendChild(li);
                    });
                }
                if (aboutLangs) {
                    aboutLangs.innerHTML = '';
                    uniqueLanguages.forEach(lang => {
                        const span = document.createElement('span');
                        span.className = 'skill-pill';
                        span.textContent = lang;
                        aboutLangs.appendChild(span);
                    });
                }
            }

            // 4. Populate dynamic Topics (Frameworks/Tools) in index.html and about.html
            const indexTopics = document.getElementById('dynamic-topics-index');
            const aboutTopics = document.getElementById('dynamic-topics-about');

            if (uniqueTopics.size > 0) {
                if (indexTopics) {
                    indexTopics.innerHTML = '';
                    uniqueTopics.forEach(topic => {
                        const li = document.createElement('li');
                        // Make topic format nice (e.g. react-js -> React-js)
                        li.textContent = topic.charAt(0).toUpperCase() + topic.slice(1);
                        indexTopics.appendChild(li);
                    });
                }
                if (aboutTopics) {
                    aboutTopics.innerHTML = '';
                    uniqueTopics.forEach(topic => {
                        const span = document.createElement('span');
                        span.className = 'skill-pill';
                        span.textContent = topic.charAt(0).toUpperCase() + topic.slice(1);
                        aboutTopics.appendChild(span);
                    });
                }
            }

            // 4.5 Fetch Exact Language Bytes for Dynamic Progress Bars
            const dynamicBars = document.getElementById('dynamic-skill-bars');
            if (dynamicBars) {
                const renderFallbackBars = () => {
                    const fallbackSkills = [
                        { name: "JavaScript", percentage: 90 },
                        { name: "HTML", percentage: 85 },
                        { name: "CSS", percentage: 82 },
                        { name: "Python", percentage: 78 },
                        { name: "TypeScript", percentage: 70 },
                        { name: "Jupyter Notebook", percentage: 65 }
                    ];

                    dynamicBars.innerHTML = '';

                    fallbackSkills.forEach((skill, index) => {
                        const colorClass = index < 6 ? `bar-color-${index}` : 'bar-color-default';
                        const barContainer = document.createElement('div');
                        barContainer.className = 'skill-bar-container';
                        barContainer.innerHTML = `
                            <div class="skill-info">
                                <span class="skill-name">${skill.name}</span>
                                <span class="skill-pct">${skill.percentage}%</span>
                            </div>
                            <div class="skill-track">
                                <div class="skill-fill ${colorClass}" style="width: 0%" data-target-width="${skill.percentage}%"></div>
                            </div>
                        `;
                        dynamicBars.appendChild(barContainer);
                    });

                    setTimeout(() => {
                        dynamicBars.querySelectorAll('.skill-fill').forEach(fill => {
                            fill.style.width = fill.getAttribute('data-target-width');
                        });
                    }, 100);
                };

                if (Array.isArray(reposData)) {
                    try {
                        const langPromises = reposData.map(repo => {
                            return fetch(repo.languages_url).then(res => res.json()).catch(() => ({}));
                        });

                        const langResults = await Promise.all(langPromises);
                        const languageBytes = {};
                        let totalBytes = 0;

                        langResults.forEach(langs => {
                            for (const [lang, bytes] of Object.entries(langs)) {
                                if (typeof bytes === 'number' && typeof lang === 'string') {
                                    if (lang.toLowerCase() !== "message") {
                                        languageBytes[lang] = (languageBytes[lang] || 0) + bytes;
                                        totalBytes += bytes;
                                    }
                                }
                            }
                        });

                        if (totalBytes > 0) {
                            const skillPercentages = Object.entries(languageBytes)
                                .map(([lang, bytes]) => ({
                                    name: lang,
                                    percentage: Math.round((bytes / totalBytes) * 100)
                                }))
                                .filter(skill => skill.percentage > 0)
                                .sort((a, b) => b.percentage - a.percentage)
                                .slice(0, 6);

                            dynamicBars.innerHTML = '';

                            skillPercentages.forEach((skill, index) => {
                                const barContainer = document.createElement('div');
                                barContainer.className = 'skill-bar-container';
                                const colorClass = index < 6 ? `bar-color-${index}` : 'bar-color-default';

                                barContainer.innerHTML = `
                                    <div class="skill-info">
                                        <span class="skill-name">${skill.name}</span>
                                        <span class="skill-pct">${skill.percentage}%</span>
                                    </div>
                                    <div class="skill-track">
                                        <div class="skill-fill ${colorClass}" style="width: 0%" data-target-width="${skill.percentage}%"></div>
                                    </div>
                                `;
                                dynamicBars.appendChild(barContainer);
                            });

                            setTimeout(() => {
                                const fills = dynamicBars.querySelectorAll('.skill-fill');
                                fills.forEach(fill => {
                                    fill.style.width = fill.getAttribute('data-target-width');
                                });
                            }, 100);
                        } else {
                            renderFallbackBars();
                        }
                    } catch (error) {
                        console.error("Failed to load skill bars", error);
                        renderFallbackBars();
                    }
                } else {
                    renderFallbackBars();
                }
            }

            // 5. Fetch Total Commits
            let totalCommits = 26;
            try {
                const commitsRes = await fetch(`https://api.github.com/search/commits?q=author:${username}`, {
                    headers: { 'Accept': 'application/vnd.github.cloak-preview' }
                });
                const commitsData = await commitsRes.json();
                if (commitsData && commitsData.total_count) {
                    totalCommits = commitsData.total_count;
                }
            } catch (err) {
                console.warn('Commits fetch skipped due to rate limit.', err);
            }

            // Update DOM data-targets securely using IDs
            const elLines = document.getElementById('stat-lines');
            const elCommits = document.getElementById('stat-commits');
            const elProjects = document.getElementById('stat-projects');

            if (elLines) elLines.setAttribute('data-target', totalSize); // Lines of Code (~KB)
            if (elCommits) elCommits.setAttribute('data-target', totalCommits); // Commits
            if (elProjects) elProjects.setAttribute('data-target', projectsCount); // Projects

            // Now attach the animation observer
            counters.forEach(counter => {
                counterObserver.observe(counter);
            });

        } catch (error) {
            console.error('GitHub API error:', error);
            // Even if it fails entirely, run animation on HTML defaults
            counters.forEach(counter => {
                counterObserver.observe(counter);
            });
        }
    }

    // Call the feature
    fetchGitHubStats();
});
