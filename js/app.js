const LinkApp = {
    // Configurações - ALTERE A SENHA AQUI
    config: {
        adminPassword: 'alissonmaxsp', // Mude para sua senha
        storageKey: 'meusLinks_data'
    },

    // Links iniciais (seus links atuais)
    defaultLinks: [
        {
            id: 1,
            title: 'ScaleBot Dashboard',
            url: 'https://scalebot.sbs/dashboard',
            icon: '🤖',
            color: '#3b82f6',
            clicks: 0
        },
        {
            id: 2,
            title: 'EcomFlow',
            url: 'https://ecomflow-dusky.vercel.app/',
            icon: '🛒',
            color: '#10b981',
            clicks: 0
        },
        {
            id: 3,
            title: 'Gerador de Nome',
            url: 'https://brunalopeesss852-maker.github.io/site-gerador-de-nome/',
            icon: '✏️',
            color: '#f59e0b',
            clicks: 0
        },
        {
            id: 4,
            title: 'Deft Monstera',
            url: 'https://deft-monstera-221d39.netlify.app/',
            icon: '🌿',
            color: '#22c55e',
            clicks: 0
        },
        {
            id: 5,
            title: 'Chat Hub',
            url: 'https://chat-hub-vert.vercel.app/',
            icon: '💬',
            color: '#8b5cf6',
            clicks: 0
        },
        {
            id: 6,
            title: 'Escola de Prompt',
            url: 'https://escola-de-prompt.vercel.app/',
            icon: '🎓',
            color: '#ec4899',
            clicks: 0
        },
        {
            id: 7,
            title: 'Nexus 2FA',
            url: 'https://nexus-2fa.vercel.app/',
            icon: '🔐',
            color: '#ef4444',
            clicks: 0
        }
    ],

    // Inicializa dados
    init() {
        if (!localStorage.getItem(this.config.storageKey)) {
            localStorage.setItem(this.config.storageKey, JSON.stringify(this.defaultLinks));
        }
    },

    // Obtém links do storage
    getLinks() {
        return JSON.parse(localStorage.getItem(this.config.storageKey)) || this.defaultLinks;
    },

    // Salva links
    saveLinks(links) {
        localStorage.setItem(this.config.storageKey, JSON.stringify(links));
    },

    // Renderiza links na página pública
    renderPublicLinks() {
        this.init();
        const container = document.getElementById('linksContainer');
        const links = this.getLinks();
        
        container.innerHTML = links.map(link => `
            <a href="${link.url}" 
               target="_blank" 
               class="link-card" 
               onclick="LinkApp.trackClick(${link.id})"
               style="--accent: ${link.color || '#667eea'}">
                <span class="link-icon">${link.icon || '🔗'}</span>
                <div class="link-info">
                    <div class="link-title">${link.title}</div>
                    <div class="link-url">${link.url}</div>
                </div>
                <span class="click-count">${link.clicks || 0}</span>
            </a>
        `).join('');
    },

    // Registra clique
    trackClick(id) {
        const links = this.getLinks();
        const link = links.find(l => l.id === id);
        if (link) {
            link.clicks = (link.clicks || 0) + 1;
            this.saveLinks(links);
        }
    },

    // ========== ADMIN FUNCTIONS ==========

    // Verifica login
    checkLogin() {
        const isLogged = sessionStorage.getItem('adminLogged') === 'true';
        if (isLogged) {
            this.showAdminPanel();
        }
    },

    // Login
    login() {
        const password = document.getElementById('adminPassword').value;
        if (password === this.config.adminPassword) {
            sessionStorage.setItem('adminLogged', 'true');
            this.showAdminPanel();
        } else {
            alert('Senha incorreta!');
        }
    },

    // Mostra painel admin
    showAdminPanel() {
        document.getElementById('loginSection').classList.add('hidden');
        document.getElementById('adminPanel').classList.remove('hidden');
        this.renderAdminLinks();
        this.renderStats();
    },

    // Renderiza lista no admin
    renderAdminLinks() {
        const container = document.getElementById('adminLinksList');
        const links = this.getLinks();
        
        container.innerHTML = links.map(link => `
            <div class="admin-link-item">
                <div class="admin-link-info">
                    <span class="admin-link-icon">${link.icon || '🔗'}</span>
                    <div class="admin-link-details">
                        <h3>${link.title}</h3>
                        <p>${link.url}</p>
                    </div>
                </div>
                <div class="admin-link-actions">
                    <button class="btn-small btn-edit" onclick="LinkApp.editLink(${link.id})">Editar</button>
                    <button class="btn-small btn-delete" onclick="LinkApp.deleteLink(${link.id})">Excluir</button>
                </div>
            </div>
        `).join('');
    },

    // Adiciona novo link
    addLink() {
        const title = document.getElementById('newTitle').value.trim();
        const url = document.getElementById('newUrl').value.trim();
        const icon = document.getElementById('newIcon').value.trim() || '🔗';
        const color = document.getElementById('newColor').value.trim() || '#667eea';

        if (!title || !url) {
            alert('Preencha título e URL!');
            return;
        }

        const links = this.getLinks();
        const newLink = {
            id: Date.now(),
            title,
            url: url.startsWith('http') ? url : `https://${url}`,
            icon,
            color,
            clicks: 0
        };

        links.push(newLink);
        this.saveLinks(links);
        
        // Limpa campos
        document.getElementById('newTitle').value = '';
        document.getElementById('newUrl').value = '';
        document.getElementById('newIcon').value = '';
        document.getElementById('newColor').value = '';
        
        this.renderAdminLinks();
        this.renderStats();
        
        alert('Link adicionado com sucesso!');
    },

    // Edita link
    editLink(id) {
        const links = this.getLinks();
        const link = links.find(l => l.id === id);
        
        const newTitle = prompt('Novo título:', link.title);
        if (newTitle === null) return;
        
        const newUrl = prompt('Nova URL:', link.url);
        if (newUrl === null) return;
        
        const newIcon = prompt('Novo ícone (emoji):', link.icon);
        if (newIcon === null) return;

        link.title = newTitle || link.title;
        link.url = newUrl || link.url;
        link.icon = newIcon || link.icon;
        
        this.saveLinks(links);
        this.renderAdminLinks();
    },

    // Deleta link
    deleteLink(id) {
        if (!confirm('Tem certeza que deseja excluir este link?')) return;
        
        let links = this.getLinks();
        links = links.filter(l => l.id !== id);
        this.saveLinks(links);
        this.renderAdminLinks();
        this.renderStats();
    },

    // Renderiza estatísticas
    renderStats() {
        const links = this.getLinks();
        const totalClicks = links.reduce((sum, l) => sum + (l.clicks || 0), 0);
        const mostClicked = links.reduce((max, l) => (l.clicks || 0) > (max.clicks || 0) ? l : max, links[0]);
        
        const container = document.getElementById('statsContainer');
        container.innerHTML = `
            <div class="stat-card">
                <span class="stat-number">${links.length}</span>
                <div class="stat-label">Total de Links</div>
            </div>
            <div class="stat-card">
                <span class="stat-number">${totalClicks}</span>
                <div class="stat-label">Cliques Totais</div>
            </div>
            <div class="stat-card">
                <span class="stat-number">${mostClicked?.clicks || 0}</span>
                <div class="stat-label">Mais Clicado<br><small>${mostClicked?.title || '-'}</small></div>
            </div>
        `;
    }
};

// Inicializa ao carregar
LinkApp.init();
