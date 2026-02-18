const LinkApp = {
    // Configurações
    config: {
        adminPassword: 'Jovemrico31', // ALTERE SUA SENHA AQUI
        storageKey: 'meusLinks_data',
        sessionKey: 'admin_session'
    },

    // Links padrão (iniciais)
    defaultLinks: [
        {
            id: 1,
            title: 'ScaleBot Dashboard',
            url: 'https://scalebot.sbs/dashboard',
            icon: '🤖',
            color: '#3b82f6',
            category: 'projetos',
            clicks: 0,
            createdAt: Date.now()
        },
        {
            id: 2,
            title: 'EcomFlow',
            url: 'https://ecomflow-dusky.vercel.app/',
            icon: '🛒',
            color: '#10b981',
            category: 'projetos',
            clicks: 0,
            createdAt: Date.now()
        },
        {
            id: 3,
            title: 'Gerador de Nome',
            url: 'https://brunalopeesss852-maker.github.io/site-gerador-de-nome/',
            icon: '✏️',
            color: '#f59e0b',
            category: 'ferramentas',
            clicks: 0,
            createdAt: Date.now()
        },
        {
            id: 4,
            title: 'Deft Monstera',
            url: 'https://deft-monstera-221d39.netlify.app/',
            icon: '🌿',
            color: '#22c55e',
            category: 'projetos',
            clicks: 0,
            createdAt: Date.now()
        },
        {
            id: 5,
            title: 'Chat Hub',
            url: 'https://chat-hub-vert.vercel.app/',
            icon: '💬',
            color: '#8b5cf6',
            category: 'projetos',
            clicks: 0,
            createdAt: Date.now()
        },
        {
            id: 6,
            title: 'Escola de Prompt',
            url: 'https://escola-de-prompt.vercel.app/',
            icon: '🎓',
            color: '#ec4899',
            category: 'ferramentas',
            clicks: 0,
            createdAt: Date.now()
        },
        {
            id: 7,
            title: 'Nexus 2FA',
            url: 'https://nexus-2fa.vercel.app/',
            icon: '🔐',
            color: '#ef4444',
            category: 'ferramentas',
            clicks: 0,
            createdAt: Date.now()
        }
    ],

    // Estado
    deferredPrompt: null,

    // Inicialização
    init() {
        this.initStorage();
        this.renderPublicLinks();
        this.initPWA();
        this.initSearch();
        this.checkConnection();
    },

    initAdmin() {
        this.initStorage();
        this.checkAdminSession();
        this.initPWA();
    },

    initStorage() {
        if (!localStorage.getItem(this.config.storageKey)) {
            this.saveLinks(this.defaultLinks);
        }
    },

    // Storage
    getLinks() {
        try {
            return JSON.parse(localStorage.getItem(this.config.storageKey)) || this.defaultLinks;
        } catch {
            return this.defaultLinks;
        }
    },

    saveLinks(links) {
        localStorage.setItem(this.config.storageKey, JSON.stringify(links));
    },

    // Renderização Pública
    renderPublicLinks(filter = '') {
        const container = document.getElementById('linksContainer');
        const emptyState = document.getElementById('emptyState');
        let links = this.getLinks();

        // Filtra se houver busca
        if (filter) {
            const term = filter.toLowerCase();
            links = links.filter(l => 
                l.title.toLowerCase().includes(term) || 
                l.url.toLowerCase().includes(term) ||
                l.category.toLowerCase().includes(term)
            );
        }

        // Ordena por cliques (mais clicados primeiro)
        links.sort((a, b) => (b.clicks || 0) - (a.clicks || 0));

        if (links.length === 0) {
            container.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        container.innerHTML = links.map(link => `
            <a href="${link.url}" 
               target="_blank" 
               rel="noopener noreferrer"
               class="link-card" 
               onclick="LinkApp.trackClick(${link.id})"
               style="--link-color: ${link.color}">
                <div class="link-icon">${link.icon || '🔗'}</div>
                <div class="link-info">
                    <div class="link-title">${this.escapeHtml(link.title)}</div>
                    <div class="link-url">${this.escapeHtml(new URL(link.url).hostname)}</div>
                </div>
                <div class="link-stats">
                    <span class="click-badge">${link.clicks || 0}</span>
                    <span class="link-category">${link.category}</span>
                </div>
            </a>
        `).join('');
    },

    // Busca
    initSearch() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;

        let debounceTimer;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                this.renderPublicLinks(e.target.value);
            }, 300);
        });
    },

    // Tracking
    trackClick(id) {
        const links = this.getLinks();
        const link = links.find(l => l.id === id);
        if (link) {
            link.clicks = (link.clicks || 0) + 1;
            link.lastClick = Date.now();
            this.saveLinks(links);
        }
    },

    // PWA
    initPWA() {
        // Captura evento de instalação
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });

        window.addEventListener('appinstalled', () => {
            this.deferredPrompt = null;
            this.hideInstallButton();
            this.showToast('App instalado com sucesso!', 'success');
        });

        // Verifica se já está instalado
        if (window.matchMedia('(display-mode: standalone)').matches) {
            this.hideInstallButton();
        }
    },

    showInstallButton() {
        const btn = document.getElementById('installBtn');
        if (btn) {
            btn.style.display = 'flex';
            btn.addEventListener('click', () => this.installApp());
        }
    },

    hideInstallButton() {
        const btn = document.getElementById('installBtn');
        if (btn) btn.style.display = 'none';
    },

    async installApp() {
        if (!this.deferredPrompt) return;
        
        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            console.log('Usuário instalou o PWA');
        }
        this.deferredPrompt = null;
    },

    // Conexão
    checkConnection() {
        const updateStatus = () => {
            const indicator = document.getElementById('offlineIndicator');
            if (!navigator.onLine) {
                if (indicator) indicator.style.display = 'flex';
                this.showToast('Você está offline', 'warning');
            } else {
                if (indicator) indicator.style.display = 'none';
            }
        };

        window.addEventListener('online', () => {
            updateStatus();
            this.showToast('Conexão restaurada', 'success');
        });
        
        window.addEventListener('offline', updateStatus);
        updateStatus();
    },

    // Admin
    checkAdminSession() {
        const isLogged = sessionStorage.getItem(this.config.sessionKey) === 'true';
        if (isLogged) {
            this.showAdminPanel();
        }
    },

    login() {
        const password = document.getElementById('adminPassword').value;
        if (password === this.config.adminPassword) {
            sessionStorage.setItem(this.config.sessionKey, 'true');
            this.showAdminPanel();
            this.showToast('Login realizado!', 'success');
        } else {
            this.showToast('Senha incorreta!', 'error');
            // Shake animation
            const card = document.querySelector('.login-card');
            card.style.animation = 'shake 0.5s';
            setTimeout(() => card.style.animation = '', 500);
        }
    },

    logout() {
        sessionStorage.removeItem(this.config.sessionKey);
        location.reload();
    },

    showAdminPanel() {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        this.renderAdminStats();
        this.renderAdminLinks();
    },

    togglePassword() {
        const input = document.getElementById('adminPassword');
        input.type = input.type === 'password' ? 'text' : 'password';
    },

    // Admin Stats
    renderAdminStats() {
        const links = this.getLinks();
        const totalClicks = links.reduce((sum, l) => sum + (l.clicks || 0), 0);
        const topLink = links.reduce((max, l) => (l.clicks || 0) > (max.clicks || 0) ? l : max, links[0]);

        document.getElementById('statTotal').textContent = links.length;
        document.getElementById('statClicks').textContent = totalClicks;
        document.getElementById('statTop').textContent = topLink ? (topLink.clicks || 0) : '-';
    },

    // Admin Links List
    renderAdminLinks() {
        const container = document.getElementById('adminLinksList');
        const links = this.getLinks().sort((a, b) => b.createdAt - a.createdAt);

        container.innerHTML = links.map(link => `
            <div class="admin-link-item" style="--link-color: ${link.color}">
                <div class="admin-link-icon">${link.icon || '🔗'}</div>
                <div class="admin-link-info">
                    <h4>${this.escapeHtml(link.title)}</h4>
                    <p>${this.escapeHtml(link.url)}</p>
                </div>
                <div class="admin-link-actions">
                    <button class="btn-icon" onclick="LinkApp.editLink(${link.id})" title="Editar">✏️</button>
                    <button class="btn-icon delete" onclick="LinkApp.deleteLink(${link.id})" title="Excluir">🗑️</button>
                </div>
            </div>
        `).join('');
    },

    // CRUD
    addLink() {
        const title = document.getElementById('newTitle').value.trim();
        const url = document.getElementById('newUrl').value.trim();
        const icon = document.getElementById('newIcon').value.trim() || '🔗';
        const color = document.getElementById('newColor').value || '#667eea';
        const category = document.getElementById('newCategory').value;

        if (!title || !url) {
            this.showToast('Preencha título e URL!', 'error');
            return;
        }

        // Valida URL
        let finalUrl = url;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            finalUrl = 'https://' + url;
        }

        try {
            new URL(finalUrl);
        } catch {
            this.showToast('URL inválida!', 'error');
            return;
        }

        const links = this.getLinks();
        const newLink = {
            id: Date.now(),
            title,
            url: finalUrl,
            icon,
            color,
            category,
            clicks: 0,
            createdAt: Date.now()
        };

        links.push(newLink);
        this.saveLinks(links);

        // Limpa formulário
        document.getElementById('newTitle').value = '';
        document.getElementById('newUrl').value = '';
        document.getElementById('newIcon').value = '🔗';
        document.getElementById('newColor').value = '#667eea';

        this.renderAdminLinks();
        this.renderAdminStats();
        this.showToast('Link adicionado!', 'success');
    },

    editLink(id) {
        const links = this.getLinks();
        const link = links.find(l => l.id === id);
        if (!link) return;

        const newTitle = prompt('Título:', link.title);
        if (newTitle === null) return;
        
        const newUrl = prompt('URL:', link.url);
        if (newUrl === null) return;
        
        const newIcon = prompt('Ícone (emoji):', link.icon);
        if (newIcon === null) return;

        const newColor = prompt('Cor (hex):', link.color);
        if (newColor === null) return;

        link.title = newTitle.trim() || link.title;
        link.url = newUrl.trim() || link.url;
        link.icon = newIcon.trim() || link.icon;
        link.color = newColor.trim() || link.color;

        this.saveLinks(links);
        this.renderAdminLinks();
        this.showToast('Link atualizado!', 'success');
    },

    deleteLink(id) {
        if (!confirm('Tem certeza que deseja excluir este link?')) return;

        let links = this.getLinks();
        links = links.filter(l => l.id !== id);
        this.saveLinks(links);

        this.renderAdminLinks();
        this.renderAdminStats();
        this.showToast('Link excluído!', 'success');
    },

    // Data Management
    exportData() {
        const data = {
            links: this.getLinks(),
            exportedAt: new Date().toISOString(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `meus-links-backup-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showToast('Backup exportado!', 'success');
    },

    importData() {
        document.getElementById('importFile').click();
    },

    handleImport(input) {
        const file = input.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.links && Array.isArray(data.links)) {
                    if (confirm(`Importar ${data.links.length} links? Isso substituirá os atuais.`)) {
                        this.saveLinks(data.links);
                        this.renderAdminLinks();
                        this.renderAdminStats();
                        this.showToast('Dados importados!', 'success');
                    }
                } else {
                    throw new Error('Formato inválido');
                }
            } catch (err) {
                this.showToast('Erro ao importar: ' + err.message, 'error');
            }
        };
        reader.readAsText(file);
        input.value = '';
    },

    resetData() {
        if (!confirm('⚠️ ATENÇÃO: Isso apagará TODOS os links e restaurará os padrões. Continuar?')) return;
        
        this.saveLinks(this.defaultLinks);
        this.renderAdminLinks();
        this.renderAdminStats();
        this.showToast('Dados resetados!', 'warning');
    },

    // Utilities
    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        if (!toast) return;
        
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// CSS Animation for shake
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
`;
document.head.appendChild(style);
