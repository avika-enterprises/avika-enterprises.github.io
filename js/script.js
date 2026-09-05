document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.header');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const updateHeader = () => {
        if (window.scrollY > 8) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });

    const scrollProgress = document.getElementById('scroll-progress');
    let progressTicking = false;
    const updateProgress = () => {
        progressTicking = false;
        const doc = document.documentElement;
        const scrollTop = window.scrollY || doc.scrollTop;
        const max = (doc.scrollHeight - window.innerHeight);
        const pct = max > 0 ? Math.min(100, Math.max(0, (scrollTop / max) * 100)) : 0;
        if (scrollProgress) scrollProgress.style.width = pct + '%';
    };
    const onProgressScroll = () => {
        if (!progressTicking) {
            progressTicking = true;
            requestAnimationFrame(updateProgress);
        }
    };
    window.addEventListener('scroll', onProgressScroll, { passive: true });
    window.addEventListener('resize', onProgressScroll);
    updateProgress();

    const menuToggle = document.getElementById('menu-toggle');
    const navList = document.querySelector('.nav-list');

    menuToggle.addEventListener('click', () => {
        navList.classList.toggle('active');
        menuToggle.classList.toggle('open');
    });

    document.querySelectorAll('.nav-list a').forEach(link => {
        link.addEventListener('click', () => {
            navList.classList.remove('active');
            menuToggle.classList.remove('open');
        });
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (!targetElement) return;

            e.preventDefault();
            const headerOffset = header.offsetHeight + 8;
            const elementPosition = targetElement.getBoundingClientRect().top;
            window.scrollTo({
                top: elementPosition + window.pageYOffset - headerOffset,
                behavior: 'smooth'
            });
        });
    });

    const revealEls = document.querySelectorAll('[data-reveal]');
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        revealEls.forEach(el => observer.observe(el));
    } else {
        revealEls.forEach(el => el.classList.add('is-visible'));
    }

    const counters = document.querySelectorAll('[data-counter]');
    const formatValue = (val, suffix) => {
        return Math.round(val) + (suffix || '');
    };

    const animateCounter = (el) => {
        const target = parseFloat(el.dataset.counter) || 0;
        const suffix = el.dataset.suffix || '';
        const duration = 1600;
        if (reduceMotion) {
            el.textContent = formatValue(target, suffix);
            return;
        }
        const start = performance.now();
        const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);
        const tick = (now) => {
            const t = Math.min((now - start) / duration, 1);
            const value = easeOutQuart(t) * target;
            el.textContent = formatValue(value, suffix);
            if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    };

    if ('IntersectionObserver' in window) {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        counters.forEach(c => counterObserver.observe(c));
    } else {
        counters.forEach(c => {
            c.textContent = formatValue(parseFloat(c.dataset.counter) || 0, c.dataset.suffix || '');
        });
    }
});
