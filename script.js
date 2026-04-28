document.addEventListener('DOMContentLoaded', () => {
    const ADMIN_USERNAME = 'Nicholas';
    const ADMIN_PASSWORD = 'N1ck0528!!';
    const ADMIN_LOGIN_KEY = 'portfolioAdminLoggedIn';
    const CUSTOM_SECTIONS_KEY = 'portfolioCustomSections';
    const CUSTOM_PROJECTS_KEY = 'portfolioCustomProjects';
    const ABOUT_TEXT_KEY = 'portfolioAboutText';

    const navigationLinks = document.querySelectorAll('[data-nav-link]');

    function showPage(page) {
        if (!page) return;
        const currentPage = document.querySelector('[data-page].active');
        if (currentPage) currentPage.classList.remove('active');
        page.classList.add('active');

        const iframes = page.querySelectorAll('iframe[data-src]');
        iframes.forEach((iframe) => {
            if (!iframe.src) iframe.src = iframe.getAttribute('data-src');
        });

        const hasSlide = page.querySelector('iframe[src*="docs.google.com/presentation"]');
        if (!hasSlide) window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function clearNavActive() {
        navigationLinks.forEach((nav) => nav.classList.remove('active'));
    }

    function setNavActiveByPage(pageName) {
        const nav = document.querySelector(`[data-nav-link="${pageName}"]`);
        if (nav) nav.classList.add('active');
    }

    function openAdminPage() {
        const adminPage = document.querySelector('[data-page="admin"]');
        if (!adminPage) return;
        showPage(adminPage);
        clearNavActive();
    }

    navigationLinks.forEach((link) => {
        link.addEventListener('click', function () {
            const pageName = this.getAttribute('data-nav-link');
            const targetPage = document.querySelector(`[data-page="${pageName}"]`);
            showPage(targetPage);
            clearNavActive();
            this.classList.add('active');
        });
    });

    if (window.location.hash === '#admin') {
        openAdminPage();
    }

    document.addEventListener('keydown', (event) => {
        if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'a') {
            event.preventDefault();
            openAdminPage();
        }
    });

    function initPortfolioMediaSliders(root = document) {
        root.querySelectorAll('[data-image-slider]:not([data-slider-initialized])').forEach((sliderItem) => {
            sliderItem.setAttribute('data-slider-initialized', 'true');
            const container = sliderItem.querySelector('.project-img');
            const sources = Array.from(
                sliderItem.querySelectorAll('.project-slider-sources img, .project-slider-sources video')
            );
            const prevBtn = sliderItem.querySelector('.project-slider-prev');
            const nextBtn = sliderItem.querySelector('.project-slider-next');
            const label = sliderItem.querySelector('.project-slider-label');

            if (!container || sources.length === 0 || !prevBtn || !nextBtn) return;

            let currentIndex = 0;
            let currentVideo = null;

            function renderSlide() {
                const source = sources[currentIndex];
                if (!source) return;

                const overlay = container.querySelector('.project-img-overlay');
                container.innerHTML = '';
                if (overlay) container.appendChild(overlay);

                if (currentVideo) {
                    currentVideo.pause();
                    currentVideo = null;
                }

                let el;
                if (source.tagName === 'IMG') {
                    el = document.createElement('img');
                    el.src = source.src;
                    el.alt = source.alt || '';
                } else if (source.tagName === 'VIDEO') {
                    el = document.createElement('video');
                    el.src = source.src || source.querySelector('source')?.src;
                    el.autoplay = true;
                    el.muted = true;
                    el.loop = true;
                    el.playsInline = true;
                    el.controls = true;
                    currentVideo = el;
                } else {
                    return;
                }

                el.style.width = '100%';
                el.style.borderRadius = '10px';
                container.insertBefore(el, overlay);

                if (label) {
                    label.textContent = `${currentIndex + 1} / ${sources.length}`;
                }
            }

            prevBtn.addEventListener('click', () => {
                currentIndex = (currentIndex - 1 + sources.length) % sources.length;
                renderSlide();
            });

            nextBtn.addEventListener('click', () => {
                currentIndex = (currentIndex + 1) % sources.length;
                renderSlide();
            });

            renderSlide();
        });
    }

    document.addEventListener('click', (event) => {
        const categoryCard = event.target.closest('.category-card');
        if (categoryCard) {
            const category = categoryCard.getAttribute('data-category');
            const targetPage = document.querySelector(`[data-page="${category}"]`);
            if (targetPage) {
                showPage(targetPage);
                clearNavActive();
                setNavActiveByPage('projects');
            }
            return;
        }

        const backToProjectsBtn = event.target.closest('[data-back-to-projects]');
        if (backToProjectsBtn) {
            const projectsPage = document.querySelector('[data-page="projects"]');
            showPage(projectsPage);
            clearNavActive();
            setNavActiveByPage('projects');
            return;
        }

        const backToTechnicalDrawingsBtn = event.target.closest('[data-back-to-technical-drawings]');
        if (backToTechnicalDrawingsBtn) {
            const page = document.querySelector('[data-page="technical-drawings"]');
            if (page) {
                showPage(page);
                clearNavActive();
                setNavActiveByPage('projects');
            }
            return;
        }

        const backToCadDrawingsBtn = event.target.closest('[data-back-to-cad-drawings]');
        if (backToCadDrawingsBtn) {
            const page = document.querySelector('[data-page="cad-drawings"]');
            if (page) {
                showPage(page);
                clearNavActive();
                setNavActiveByPage('projects');
            }
            return;
        }

        const backTargetBtn = event.target.closest('[data-back-target]');
        if (backTargetBtn) {
            const target = backTargetBtn.getAttribute('data-back-target');
            const targetPage = document.querySelector(`[data-page="${target}"]`);
            if (targetPage) {
                showPage(targetPage);
                clearNavActive();
                setNavActiveByPage('projects');
            }
            return;
        }
    });

    function createSlug(value) {
        return value
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    function getStoredArray(key) {
        try {
            const parsed = JSON.parse(localStorage.getItem(key) || '[]');
            return Array.isArray(parsed) ? parsed : [];
        } catch (_error) {
            return [];
        }
    }

    function saveStoredArray(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    function normalizeProjectMedia(project) {
        if (Array.isArray(project.media) && project.media.length > 0) {
            return project.media.filter((m) => m && m.src && (m.type === 'image' || m.type === 'video'));
        }
        if (project.image) {
            const isVideo =
                String(project.image).startsWith('data:video') || String(project.image).match(/\.(mp4|webm|ogg)(\?|$)/i);
            return [{ type: isVideo ? 'video' : 'image', src: project.image }];
        }
        return [];
    }

    function createProjectCardElement(project) {
        const li = document.createElement('li');
        li.className = 'project-item active custom-project';

        const media = normalizeProjectMedia(project);
        if (media.length === 0) return li;

        const figure = document.createElement('figure');
        figure.className = 'project-img';

        const overlay = document.createElement('div');
        overlay.className = 'project-img-overlay';
        const overlayP = document.createElement('p');
        overlayP.textContent = project.description || '';
        overlay.appendChild(overlayP);
        figure.appendChild(overlay);

        const useSlider = media.length > 1;

        if (!useSlider) {
            const m = media[0];
            if (m.type === 'video') {
                const video = document.createElement('video');
                video.src = m.src;
                video.setAttribute('controls', '');
                video.setAttribute('playsinline', '');
                video.muted = true;
                video.style.width = '100%';
                video.style.borderRadius = '10px';
                figure.insertBefore(video, overlay);
            } else {
                const img = document.createElement('img');
                img.src = m.src;
                img.alt = project.title || '';
                figure.insertBefore(img, overlay);
            }
            li.appendChild(figure);
        } else {
            const first = media[0];
            if (first.type === 'video') {
                const video = document.createElement('video');
                video.src = first.src;
                video.setAttribute('controls', '');
                video.setAttribute('playsinline', '');
                video.muted = true;
                video.style.width = '100%';
                video.style.borderRadius = '10px';
                figure.insertBefore(video, overlay);
            } else {
                const img = document.createElement('img');
                img.src = first.src;
                img.alt = project.title || '';
                figure.insertBefore(img, overlay);
            }

            li.setAttribute('data-image-slider', '');

            const controls = document.createElement('div');
            controls.className = 'project-slider-controls';
            const prevBtn = document.createElement('button');
            prevBtn.type = 'button';
            prevBtn.className = 'project-slider-btn project-slider-prev';
            prevBtn.setAttribute('aria-label', 'Previous media');
            prevBtn.innerHTML = '&#10094;';
            const label = document.createElement('span');
            label.className = 'project-slider-label';
            label.textContent = `1 / ${media.length}`;
            const nextBtn = document.createElement('button');
            nextBtn.type = 'button';
            nextBtn.className = 'project-slider-btn project-slider-next';
            nextBtn.setAttribute('aria-label', 'Next media');
            nextBtn.innerHTML = '&#10095;';
            controls.appendChild(prevBtn);
            controls.appendChild(label);
            controls.appendChild(nextBtn);

            const sourcesWrap = document.createElement('div');
            sourcesWrap.className = 'project-slider-sources';
            sourcesWrap.hidden = true;
            media.forEach((m, index) => {
                if (m.type === 'video') {
                    const video = document.createElement('video');
                    video.src = m.src;
                    video.setAttribute('playsinline', '');
                    sourcesWrap.appendChild(video);
                } else {
                    const img = document.createElement('img');
                    img.src = m.src;
                    img.alt = `${project.title || 'Project'} ${index + 1}`;
                    sourcesWrap.appendChild(img);
                }
            });

            li.appendChild(figure);
            li.appendChild(controls);
            li.appendChild(sourcesWrap);
        }

        const content = document.createElement('div');
        content.className = 'project-content';
        const titleEl = document.createElement('h3');
        titleEl.className = 'project-title';
        titleEl.textContent = project.title || '';
        const catEl = document.createElement('p');
        catEl.className = 'project-category';
        catEl.textContent = project.category || '';
        content.appendChild(titleEl);
        content.appendChild(catEl);
        li.appendChild(content);

        return li;
    }

    function getSectionCategoriesContainer(parentSlug) {
        const pageSelector = parentSlug ? `[data-page="${parentSlug}"]` : '[data-page="projects"]';
        const page = document.querySelector(pageSelector);
        if (!page) return document.querySelector('[data-page="projects"] .project-categories');
        let grid = page.querySelector('.project-categories');
        if (!grid) {
            grid = document.createElement('section');
            grid.className = 'project-categories';
            const header = page.querySelector('header');
            const projectsSection = page.querySelector('.projects-section');
            if (header && projectsSection) {
                projectsSection.parentNode.insertBefore(grid, projectsSection);
            } else {
                page.appendChild(grid);
            }
        }
        return grid;
    }

    function createCustomSectionArticle(section) {
        const existing = document.querySelector(`[data-page="${section.slug}"]`);
        if (existing) return existing;

        const article = document.createElement('article');
        article.className = 'project-detail custom-section-detail';
        article.setAttribute('data-page', section.slug);

        const parentSlug = section.parentSlug || '';
        const backTarget = parentSlug || 'projects';
        const backLabel = parentSlug ? 'Back' : 'Back to Projects';

        const header = document.createElement('header');
        const backBtn = document.createElement('button');
        backBtn.type = 'button';
        backBtn.className = 'back-btn';
        backBtn.setAttribute('data-back-target', backTarget);
        backBtn.innerHTML = `<i class="fas fa-arrow-left"></i><span>${backLabel}</span>`;
        const title = document.createElement('h2');
        title.className = 'h2 article-title';
        title.textContent = section.name || '';
        const intro = document.createElement('p');
        intro.className = 'section-intro';
        intro.textContent = section.description || '';
        header.appendChild(backBtn);
        header.appendChild(title);
        header.appendChild(intro);

        const categories = document.createElement('section');
        categories.className = 'project-categories';

        const projectsSection = document.createElement('section');
        projectsSection.className = 'projects-section';
        const list = document.createElement('ul');
        list.className = 'project-list';
        projectsSection.appendChild(list);

        article.appendChild(header);
        article.appendChild(categories);
        article.appendChild(projectsSection);

        const mainContent = document.querySelector('.main-content');
        const contactPage = document.querySelector('[data-page="contact"]');
        if (mainContent && contactPage) {
            mainContent.insertBefore(article, contactPage);
        }
        return article;
    }

    function createCustomSectionCard(section) {
        const existing = document.querySelector(`.category-card[data-category="${section.slug}"]`);
        if (existing) return;

        const projectsCategories = getSectionCategoriesContainer(section.parentSlug || '');
        if (!projectsCategories) return;

        const card = document.createElement('div');
        card.className = 'category-card custom-category-card';
        card.setAttribute('data-category', section.slug);

        const iconBox = document.createElement('div');
        iconBox.className = 'category-icon';
        const iconEl = document.createElement('i');
        const iconClasses = (section.icon || 'fas fa-folder-open').trim().split(/\s+/).filter(Boolean);
        iconClasses.forEach((cls) => iconEl.classList.add(cls));
        iconBox.appendChild(iconEl);

        const titleH = document.createElement('h3');
        titleH.className = 'category-title';
        titleH.textContent = section.name || '';

        const desc = document.createElement('p');
        desc.className = 'category-description';
        desc.textContent = section.description || '';

        const count = document.createElement('div');
        count.className = 'category-count';
        count.textContent = '0 Projects';

        card.appendChild(iconBox);
        card.appendChild(titleH);
        card.appendChild(desc);
        card.appendChild(count);
        projectsCategories.appendChild(card);
    }

    function updateSectionCount(sectionSlug) {
        const list = document.querySelector(`[data-page="${sectionSlug}"] .project-list`);
        const count = list ? list.querySelectorAll('.project-item').length : 0;
        const countEl = document.querySelector(`.category-card[data-category="${sectionSlug}"] .category-count`);
        if (countEl) countEl.textContent = `${count} Project${count === 1 ? '' : 's'}`;
    }

    function hydrateCustomSections() {
        const sections = getStoredArray(CUSTOM_SECTIONS_KEY);
        const pending = [...sections];
        const guard = pending.length + 5;
        let iterations = 0;
        while (pending.length > 0 && iterations < guard) {
            iterations += 1;
            const index = pending.findIndex(
                (section) => !section.parentSlug || document.querySelector(`[data-page="${section.parentSlug}"]`)
            );
            if (index === -1) {
                pending.forEach((section) => {
                    section.parentSlug = '';
                    createCustomSectionArticle(section);
                    createCustomSectionCard(section);
                });
                saveStoredArray(CUSTOM_SECTIONS_KEY, sections);
                break;
            }
            const section = pending.splice(index, 1)[0];
            createCustomSectionArticle(section);
            createCustomSectionCard(section);
        }
        return sections;
    }

    function hydrateCustomProjects() {
        const projects = getStoredArray(CUSTOM_PROJECTS_KEY);
        projects.forEach((project) => {
            const list = document.querySelector(`[data-page="${project.sectionSlug}"] .project-list`);
            if (!list) return;

            const duplicate = Array.from(list.querySelectorAll('.project-title')).some(
                (titleEl) => titleEl.textContent.trim() === project.title
            );
            if (duplicate) return;

            const card = createProjectCardElement(project);
            list.appendChild(card);
            initPortfolioMediaSliders(card);
            updateSectionCount(project.sectionSlug);
        });
    }

    function updateProjectSectionOptions() {
        const select = document.getElementById('projectSectionSelect');
        const removeSectionSelect = document.getElementById('removeProjectSectionSelect');
        if (!select && !removeSectionSelect) return;

        if (select) select.innerHTML = '';
        if (removeSectionSelect) removeSectionSelect.innerHTML = '';
        const pagesWithProjects = document.querySelectorAll('[data-page]');
        pagesWithProjects.forEach((page) => {
            const list = page.querySelector('.project-list');
            if (!list) return;

            const pageName = page.getAttribute('data-page');
            const heading = page.querySelector('.article-title');
            const option = document.createElement('option');
            option.value = pageName;
            option.textContent = heading ? heading.textContent.trim() : pageName;
            if (select) select.appendChild(option);
            if (removeSectionSelect) removeSectionSelect.appendChild(option.cloneNode(true));
        });
    }

    function updateProjectRemovalOptions(sectionSlug) {
        const removeProjectSelect = document.getElementById('removeProjectSelect');
        if (!removeProjectSelect) return;

        removeProjectSelect.innerHTML = '';
        const list = document.querySelector(`[data-page="${sectionSlug}"] .project-list`);
        if (!list) return;

        const projectItems = list.querySelectorAll('.project-item');
        projectItems.forEach((item, index) => {
            const title = item.querySelector('.project-title')?.textContent?.trim() || `Project ${index + 1}`;
            const option = document.createElement('option');
            option.value = String(index);
            option.textContent = title;
            removeProjectSelect.appendChild(option);
        });
    }

    function updateSectionRemovalOptions() {
        const removeSectionSelect = document.getElementById('removeSectionSelect');
        if (!removeSectionSelect) return;

        removeSectionSelect.innerHTML = '';
        const customSections = getStoredArray(CUSTOM_SECTIONS_KEY);
        customSections.forEach((section) => {
            const option = document.createElement('option');
            option.value = section.slug;
            option.textContent = section.parentSlug ? `${section.name} (inside another section)` : section.name;
            removeSectionSelect.appendChild(option);
        });
    }

    function populateSectionParentSelect() {
        const sel = document.getElementById('sectionParentSelect');
        if (!sel) return;

        const previous = sel.value;
        sel.innerHTML = '';

        const topOpt = document.createElement('option');
        topOpt.value = '';
        topOpt.textContent = 'Top level — shows on main Projects grid';
        sel.appendChild(topOpt);

        const skipParents = new Set(['about', 'admin', 'contact', 'experience', 'skills']);

        document.querySelectorAll('[data-page]').forEach((page) => {
            const slug = page.getAttribute('data-page');
            if (!slug || skipParents.has(slug)) return;

            const hasList = page.querySelector('.project-list');
            const hasCategories = page.querySelector('.project-categories');
            if (!hasList && !hasCategories) return;

            const heading = page.querySelector('.article-title');
            const label = heading ? heading.textContent.trim() : slug;

            const opt = document.createElement('option');
            opt.value = slug;
            opt.textContent = label;
            sel.appendChild(opt);
        });

        if ([...sel.options].some((opt) => opt.value === previous)) {
            sel.value = previous;
        }
    }

    function applyAboutTextFromStorage() {
        const aboutParas = document.querySelectorAll('[data-page="about"] .about-text p');
        if (aboutParas.length < 2) return;

        try {
            const saved = JSON.parse(localStorage.getItem(ABOUT_TEXT_KEY) || 'null');
            if (saved && typeof saved.p1 === 'string' && typeof saved.p2 === 'string') {
                aboutParas[0].textContent = saved.p1;
                aboutParas[1].textContent = saved.p2;
            }
        } catch (_error) {
            // Ignore invalid localStorage data
        }
    }

    function setupAdminPanel() {
        const loginCard = document.getElementById('adminLoginCard');
        const adminTools = document.getElementById('adminTools');
        const loginForm = document.getElementById('adminLoginForm');
        const loginMessage = document.getElementById('adminLoginMessage');
        const logoutBtn = document.getElementById('adminLogoutBtn');
        const aboutEditForm = document.getElementById('aboutEditForm');
        const aboutEditMessage = document.getElementById('aboutEditMessage');
        const addSectionForm = document.getElementById('addSectionForm');
        const addSectionMessage = document.getElementById('addSectionMessage');
        const addProjectForm = document.getElementById('addProjectForm');
        const addProjectMessage = document.getElementById('addProjectMessage');
        const projectImageDropzone = document.getElementById('projectImageDropzone');
        const projectImageFile = document.getElementById('projectImageFile');
        const projectImageDropzoneText = document.getElementById('projectImageDropzoneText');
        const projectMediaList = document.getElementById('projectMediaList');
        const projectMediaClearBtn = document.getElementById('projectMediaClearBtn');
        const projectVideoUrls = document.getElementById('projectVideoUrls');
        const removeProjectForm = document.getElementById('removeProjectForm');
        const removeProjectMessage = document.getElementById('removeProjectMessage');
        const removeProjectSectionSelect = document.getElementById('removeProjectSectionSelect');
        const removeProjectSelect = document.getElementById('removeProjectSelect');
        const removeSectionForm = document.getElementById('removeSectionForm');
        const removeSectionMessage = document.getElementById('removeSectionMessage');
        const aboutParas = document.querySelectorAll('[data-page="about"] .about-text p');

        if (!loginCard || !adminTools || !loginForm || !logoutBtn || aboutParas.length < 2) return;
        const uploadedProjectMedia = [];

        function setDropzoneText(text) {
            if (projectImageDropzoneText) projectImageDropzoneText.textContent = text;
        }

        function updateMediaListText() {
            if (!projectMediaList) return;
            if (uploadedProjectMedia.length === 0) {
                projectMediaList.textContent = '';
                setDropzoneText('Drop images or videos here, or click to add files (multiple allowed)');
                return;
            }
            projectMediaList.textContent = `${uploadedProjectMedia.length} file(s) ready (images and uploaded videos).`;
            setDropzoneText('Add more files, or use Clear to start over');
        }

        function readFileAsDataURL(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(String(reader.result || ''));
                reader.onerror = () => reject(new Error('Failed to read file.'));
                reader.readAsDataURL(file);
            });
        }

        async function appendProjectMediaFiles(fileList) {
            const files = Array.from(fileList || []).filter(Boolean);
            for (const file of files) {
                if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
                    addProjectMessage.textContent = 'Only image or video files can be uploaded here.';
                    addProjectMessage.className = 'admin-message error';
                    continue;
                }
                try {
                    const dataUrl = await readFileAsDataURL(file);
                    uploadedProjectMedia.push({
                        type: file.type.startsWith('video/') ? 'video' : 'image',
                        src: dataUrl
                    });
                } catch (_error) {
                    addProjectMessage.textContent = 'Could not read one of the files.';
                    addProjectMessage.className = 'admin-message error';
                }
            }
            addProjectMessage.textContent = '';
            addProjectMessage.className = 'admin-message';
            updateMediaListText();
        }

        function setAdminState(loggedIn) {
            if (loggedIn) {
                loginCard.classList.add('hidden');
                adminTools.classList.remove('hidden');
                updateProjectSectionOptions();
                updateSectionRemovalOptions();
                populateSectionParentSelect();
                if (removeProjectSectionSelect && removeProjectSectionSelect.value) {
                    updateProjectRemovalOptions(removeProjectSectionSelect.value);
                }
                document.getElementById('aboutPara1').value = aboutParas[0].textContent.trim();
                document.getElementById('aboutPara2').value = aboutParas[1].textContent.trim();
            } else {
                loginCard.classList.remove('hidden');
                adminTools.classList.add('hidden');
            }
        }

        const savedLogin = localStorage.getItem(ADMIN_LOGIN_KEY) === 'true';
        setAdminState(savedLogin);

        if (projectImageDropzone && projectImageFile) {
            projectImageDropzone.addEventListener('click', () => {
                projectImageFile.click();
            });

            projectImageFile.addEventListener('change', async () => {
                const files = projectImageFile.files;
                if (!files || files.length === 0) return;
                await appendProjectMediaFiles(files);
                projectImageFile.value = '';
            });

            projectImageDropzone.addEventListener('dragover', (event) => {
                event.preventDefault();
                projectImageDropzone.classList.add('dragover');
            });

            projectImageDropzone.addEventListener('dragleave', () => {
                projectImageDropzone.classList.remove('dragover');
            });

            projectImageDropzone.addEventListener('drop', async (event) => {
                event.preventDefault();
                projectImageDropzone.classList.remove('dragover');
                const files = event.dataTransfer?.files;
                if (!files || files.length === 0) return;
                await appendProjectMediaFiles(files);
            });
        }

        if (projectMediaClearBtn && projectImageFile) {
            projectMediaClearBtn.addEventListener('click', () => {
                uploadedProjectMedia.length = 0;
                projectImageFile.value = '';
                updateMediaListText();
            });
        }

        if (removeProjectSectionSelect) {
            removeProjectSectionSelect.addEventListener('change', () => {
                updateProjectRemovalOptions(removeProjectSectionSelect.value);
            });
        }

        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const username = document.getElementById('adminUsername').value.trim();
            const password = document.getElementById('adminPassword').value;

            if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
                localStorage.setItem(ADMIN_LOGIN_KEY, 'true');
                loginMessage.textContent = 'Login successful.';
                loginMessage.className = 'admin-message success';
                setAdminState(true);
            } else {
                loginMessage.textContent = 'Incorrect username or password.';
                loginMessage.className = 'admin-message error';
            }
        });

        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem(ADMIN_LOGIN_KEY);
            loginForm.reset();
            loginMessage.textContent = '';
            loginMessage.className = 'admin-message';
            setAdminState(false);
        });

        aboutEditForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const p1 = document.getElementById('aboutPara1').value.trim();
            const p2 = document.getElementById('aboutPara2').value.trim();
            if (!p1 || !p2) {
                aboutEditMessage.textContent = 'Both about fields are required.';
                aboutEditMessage.className = 'admin-message error';
                return;
            }

            aboutParas[0].textContent = p1;
            aboutParas[1].textContent = p2;
            localStorage.setItem(ABOUT_TEXT_KEY, JSON.stringify({ p1, p2 }));
            aboutEditMessage.textContent = 'About section updated.';
            aboutEditMessage.className = 'admin-message success';
        });

        addSectionForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const sectionName = document.getElementById('sectionName').value.trim();
            const sectionDescription = document.getElementById('sectionDescription').value.trim();
            const sectionIcon = document.getElementById('sectionIcon').value.trim() || 'fas fa-folder-open';
            const parentSlug = (document.getElementById('sectionParentSelect')?.value || '').trim();

            if (!sectionName || !sectionDescription) {
                addSectionMessage.textContent = 'Section name and description are required.';
                addSectionMessage.className = 'admin-message error';
                return;
            }

            const slug = createSlug(sectionName);
            if (!slug) {
                addSectionMessage.textContent = 'Please enter a valid section name.';
                addSectionMessage.className = 'admin-message error';
                return;
            }

            if (document.querySelector(`[data-page="${slug}"]`)) {
                addSectionMessage.textContent = 'A section with that name already exists.';
                addSectionMessage.className = 'admin-message error';
                return;
            }

            if (parentSlug && !document.querySelector(`[data-page="${parentSlug}"]`)) {
                addSectionMessage.textContent = 'Parent section was not found.';
                addSectionMessage.className = 'admin-message error';
                return;
            }

            const section = {
                name: sectionName,
                description: sectionDescription,
                icon: sectionIcon,
                slug,
                parentSlug: parentSlug || ''
            };
            createCustomSectionArticle(section);
            createCustomSectionCard(section);
            updateSectionCount(slug);

            const storedSections = getStoredArray(CUSTOM_SECTIONS_KEY);
            storedSections.push(section);
            saveStoredArray(CUSTOM_SECTIONS_KEY, storedSections);

            addSectionForm.reset();
            updateProjectSectionOptions();
            updateSectionRemovalOptions();
            populateSectionParentSelect();
            addSectionMessage.textContent = 'Section added successfully.';
            addSectionMessage.className = 'admin-message success';
        });

        addProjectForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const sectionSlug = document.getElementById('projectSectionSelect').value;
            const title = document.getElementById('projectTitle').value.trim();
            const category = document.getElementById('projectCategory').value.trim();
            const description = document.getElementById('projectDescription').value.trim();
            const urlLines = (projectVideoUrls?.value || '')
                .split('\n')
                .map((line) => line.trim())
                .filter(Boolean);
            const urlMedia = urlLines
                .filter((url) => /^https?:\/\//i.test(url))
                .map((url) => ({ type: 'video', src: url }));
            const fileMedia = uploadedProjectMedia.map((item) => ({ ...item }));
            const media = [...fileMedia, ...urlMedia];

            if (!sectionSlug || !title || !category || !description || media.length === 0) {
                addProjectMessage.textContent =
                    'Title, category, description, and at least one image/video (upload or video URL) are required.';
                addProjectMessage.className = 'admin-message error';
                return;
            }

            const projectList = document.querySelector(`[data-page="${sectionSlug}"] .project-list`);
            if (!projectList) {
                addProjectMessage.textContent = 'Selected section cannot hold projects.';
                addProjectMessage.className = 'admin-message error';
                return;
            }

            const project = { sectionSlug, title, category, description, media };
            const card = createProjectCardElement(project);
            projectList.appendChild(card);
            initPortfolioMediaSliders(card);

            const storedProjects = getStoredArray(CUSTOM_PROJECTS_KEY);
            storedProjects.push(project);
            saveStoredArray(CUSTOM_PROJECTS_KEY, storedProjects);

            updateSectionCount(sectionSlug);
            addProjectForm.reset();
            uploadedProjectMedia.length = 0;
            if (projectVideoUrls) projectVideoUrls.value = '';
            updateMediaListText();
            if (removeProjectSectionSelect && removeProjectSectionSelect.value === sectionSlug) {
                updateProjectRemovalOptions(sectionSlug);
            }
            addProjectMessage.textContent = 'Project added successfully.';
            addProjectMessage.className = 'admin-message success';
        });

        if (removeProjectForm && removeProjectSectionSelect && removeProjectSelect) {
            removeProjectForm.addEventListener('submit', (event) => {
                event.preventDefault();
                const sectionSlug = removeProjectSectionSelect.value;
                const projectIndex = Number(removeProjectSelect.value);
                const projectList = document.querySelector(`[data-page="${sectionSlug}"] .project-list`);
                if (!projectList || Number.isNaN(projectIndex)) {
                    removeProjectMessage.textContent = 'Please select a valid project.';
                    removeProjectMessage.className = 'admin-message error';
                    return;
                }

                const projectItems = Array.from(projectList.querySelectorAll('.project-item'));
                const targetItem = projectItems[projectIndex];
                if (!targetItem) {
                    removeProjectMessage.textContent = 'Project not found.';
                    removeProjectMessage.className = 'admin-message error';
                    return;
                }

                const title = targetItem.querySelector('.project-title')?.textContent?.trim() || '';
                targetItem.remove();
                updateSectionCount(sectionSlug);

                let storedProjects = getStoredArray(CUSTOM_PROJECTS_KEY);
                const customMatchIndex = storedProjects.findIndex(
                    (project) => project.sectionSlug === sectionSlug && project.title === title
                );
                if (customMatchIndex >= 0) {
                    storedProjects.splice(customMatchIndex, 1);
                    saveStoredArray(CUSTOM_PROJECTS_KEY, storedProjects);
                }

                updateProjectRemovalOptions(sectionSlug);
                removeProjectMessage.textContent = 'Project removed successfully.';
                removeProjectMessage.className = 'admin-message success';
            });
        }

        if (removeSectionForm) {
            removeSectionForm.addEventListener('submit', (event) => {
                event.preventDefault();
                const sectionSlug = document.getElementById('removeSectionSelect').value;
                if (!sectionSlug) {
                    removeSectionMessage.textContent = 'Please select a section.';
                    removeSectionMessage.className = 'admin-message error';
                    return;
                }

                let customSections = getStoredArray(CUSTOM_SECTIONS_KEY);
                const sectionIndex = customSections.findIndex((section) => section.slug === sectionSlug);
                if (sectionIndex === -1) {
                    removeSectionMessage.textContent = 'Only custom sections can be removed.';
                    removeSectionMessage.className = 'admin-message error';
                    return;
                }

                const toRemove = new Set([sectionSlug]);
                let growing = true;
                while (growing) {
                    growing = false;
                    customSections.forEach((section) => {
                        if (!toRemove.has(section.slug) && section.parentSlug && toRemove.has(section.parentSlug)) {
                            toRemove.add(section.slug);
                            growing = true;
                        }
                    });
                }

                toRemove.forEach((slug) => {
                    const card = document.querySelector(`.category-card[data-category="${slug}"]`);
                    const page = document.querySelector(`[data-page="${slug}"]`);
                    if (card) card.remove();
                    if (page) page.remove();
                });

                customSections = customSections.filter((section) => !toRemove.has(section.slug));
                saveStoredArray(CUSTOM_SECTIONS_KEY, customSections);

                let storedProjects = getStoredArray(CUSTOM_PROJECTS_KEY);
                storedProjects = storedProjects.filter((project) => !toRemove.has(project.sectionSlug));
                saveStoredArray(CUSTOM_PROJECTS_KEY, storedProjects);

                updateProjectSectionOptions();
                updateSectionRemovalOptions();
                populateSectionParentSelect();
                if (removeProjectSectionSelect?.value) {
                    updateProjectRemovalOptions(removeProjectSectionSelect.value);
                } else if (removeProjectSectionSelect?.options.length) {
                    updateProjectRemovalOptions(removeProjectSectionSelect.options[0].value);
                }

                removeSectionMessage.textContent =
                    toRemove.size > 1
                        ? 'Custom section and nested sections removed successfully.'
                        : 'Custom section removed successfully.';
                removeSectionMessage.className = 'admin-message success';
            });
        }

        if (removeProjectSectionSelect && removeProjectSectionSelect.options.length > 0) {
            updateProjectRemovalOptions(removeProjectSectionSelect.value);
        }
    }

    applyAboutTextFromStorage();
    hydrateCustomSections();
    hydrateCustomProjects();
    updateProjectSectionOptions();
    populateSectionParentSelect();
    initPortfolioMediaSliders(document);
    setupAdminPanel();
});