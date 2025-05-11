async function fetchNotes() {
  const response = await fetch("https://notes-api.dicoding.dev/v2/notes");
  const data = await response.json();
  console.log(data)
  return data.data;
}

// Custom Element untuk App Header
class AppHeader extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: 100%;
                }
                
                .app-header {
                    background-color: #3498db;
                    color: white;
                    padding: 20px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                }
                
                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .app-title {
                    font-size: 24px;
                    font-weight: bold;
                    margin: 0;
                }
                
                .app-subtitle {
                    font-size: 14px;
                    margin-top: 5px;
                }
            </style>
            
            <div class="app-header">
                <div class="container">
                    <div>
                        <h1 class="app-title">Notes App</h1>
                        <div class="app-subtitle">Catat semua ide dan rencana anda</div>
                    </div>
                </div>
            </div>
        `;
    }
}

// Custom Element untuk Daftar Catatan
class NotesList extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.notes =[];
    }

    static get observedAttributes() {
        return ['data-notes'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'data-notes') {
            this.notes = JSON.parse(newValue);
            this.render();
        }
    }

    async connectedCallback() {
  this.notes = await fetchNotes();
  await this.render();
        document.addEventListener('note-added', (e) => {
            this.notes.unshift(e.detail);
            this.render();
        });
    }

    render() {
        console.log(this.notes)
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }
                
                .notes-section {
                    margin-bottom: 30px;
                }
                
                .section-title {
                    font-size: 22px;
                    margin-bottom: 20px;
                    color: #2c3e50;
                    border-bottom: 2px solid #3498db;
                    padding-bottom: 10px;
                }
                
                .notes-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 20px;
                }
                
                .no-notes {
                    background-color: white;
                    border-radius: 8px;
                    padding: 20px;
                    text-align: center;
                    color: #7f8c8d;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }
                
                @media (max-width: 768px) {
                    .notes-grid {
                        grid-template-columns: 1fr;
                    }
                }
            </style>
            
            <div class="notes-section">
                <h2 class="section-title">Daftar Catatan</h2>
                
                <div class="notes-grid">
                    ${this.notes.length > 0 ? 
                        this.notes.map(note => `
                            <note-card 
                                data-id="${note.id}"
                                data-title="${note.title}"
                                data-body="${note.body}"
                                data-date="${note.date}">
                            </note-card>
                        `).join('') : 
                        `<div class="no-notes">Belum ada catatan. Silakan tambahkan catatan baru.</div>`
                    }
                </div>
            </div>
        `;

    }
}

// Custom Element untuk Card Catatan
class NoteCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['data-id', 'data-title', 'data-body', 'data-date'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this.render();
    }

    connectedCallback() {
        this.render();
    }

    render() {
        const id = this.getAttribute('data-id');
        const title = this.getAttribute('data-title');
        const body = this.getAttribute('data-body');
        const date = this.getAttribute('data-date');

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }
                
                .note-card {
                    background-color: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    padding: 20px;
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }
                
                .note-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
                }
                
                .note-title {
                    font-size: 18px;
                    font-weight: bold;
                    margin-bottom: 10px;
                    color: #2c3e50;
                }
                
                .note-body {
                    font-size: 14px;
                    line-height: 1.5;
                    color: #555;
                    flex: 1;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    display: -webkit-box;
                    -webkit-line-clamp: 5;
                    -webkit-box-orient: vertical;
                }
                
                .note-date {
                    font-size: 12px;
                    color: #999;
                    margin-top: 15px;
                    text-align: right;
                }
            </style>
            
            <div class="note-card">
                <div class="note-title">${title}</div>
                <div class="note-body">${body}</div>
            </div>
        `;
    }

}

// Custom Element untuk Form Catatan
class NoteForm extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }
                
                .note-form-container {
                    background-color: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    padding: 20px;
                }
                
                .form-title {
                    font-size: 20px;
                    margin-bottom: 20px;
                    color: #3498db;
                    border-bottom: 2px solid #3498db;
                    padding-bottom: 10px;
                }
                
                .form-group {
                    margin-bottom: 15px;
                }
                
                .form-group label {
                    display: block;
                    margin-bottom: 5px;
                    font-weight: 500;
                }
                
                .form-control {
                    width: 100%;
                    padding: 10px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-size: 14px;
                }
                
                .form-control:focus {
                    outline: none;
                    border-color: #3498db;
                    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
                }
                
                .form-control.error {
                    border-color: #e74c3c;
                }
                
                .error-message {
                    color: #e74c3c;
                    font-size: 12px;
                    margin-top: 5px;
                    display: none;
                }
                
                .error-message.show {
                    display: block;
                }
                
                textarea.form-control {
                    min-height: 150px;
                    resize: vertical;
                }
                
                .btn {
                    display: inline-block;
                    padding: 10px 20px;
                    background-color: #3498db;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 16px;
                    transition: background-color 0.3s;
                }
                
                .btn:hover {
                    background-color: #2980b9;
                }
                
                .btn-block {
                    display: block;
                    width: 100%;
                }
            </style>
            
            <div class="note-form-container">
                <h2 class="form-title">Tambah Catatan Baru</h2>
                
                <form id="noteForm">
                    <div class="form-group">
                        <label for="noteTitle">Judul</label>
                        <input type="text" id="noteTitle" class="form-control" placeholder="Masukkan judul catatan">
                        <div id="titleError" class="error-message">Judul tidak boleh kosong</div>
                    </div>
                    
                    <div class="form-group">
                        <label for="noteBody">Isi Catatan</label>
                        <textarea id="noteBody" class="form-control" placeholder="Masukkan isi catatan"></textarea>
                        <div id="bodyError" class="error-message">Isi catatan tidak boleh kosong</div>
                    </div>
                    
                    <button type="submit" class="btn btn-block">Simpan Catatan</button>
                </form>
            </div>
        `;
    }

    setupEventListeners() {
        const form = this.shadowRoot.getElementById('noteForm');
        const titleInput = this.shadowRoot.getElementById('noteTitle');
        const bodyInput = this.shadowRoot.getElementById('noteBody');
        const titleError = this.shadowRoot.getElementById('titleError');
        const bodyError = this.shadowRoot.getElementById('bodyError');

        // Validasi real-time
        titleInput.addEventListener('input', () => {
            if (titleInput.value.trim() !== '') {
                titleInput.classList.remove('error');
                titleError.classList.remove('show');
            }
        });

        bodyInput.addEventListener('input', () => {
            if (bodyInput.value.trim() !== '') {
                bodyInput.classList.remove('error');
                bodyError.classList.remove('show');
            }
        });

        // Submit handler
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            let isValid = true;
            
            // Validasi judul
            if (titleInput.value.trim() === '') {
                titleInput.classList.add('error');
                titleError.classList.add('show');
                isValid = false;
            } else {
                titleInput.classList.remove('error');
                titleError.classList.remove('show');
            }
            
            // Validasi isi
            if (bodyInput.value.trim() === '') {
                bodyInput.classList.add('error');
                bodyError.classList.add('show');
                isValid = false;
            } else {
                bodyInput.classList.remove('error');
                bodyError.classList.remove('show');
            }
            
            if (isValid) {
                const newNote = {
                    id: Date.now(),
                    title: titleInput.value.trim(),
                    body: bodyInput.value.trim(),
                    date: new Date().toISOString().split('T')[0]
                };
                
                // Dispatch custom event
                const noteAddedEvent = new CustomEvent('note-added', {
                    detail: newNote,
                    bubbles: true,
                    composed: true
                });
                
                this.dispatchEvent(noteAddedEvent);
                
                // Reset form
                form.reset();
            }
        });
    }
}

// Mendefinisikan custom elements
customElements.define('app-header', AppHeader);
customElements.define('notes-list', NotesList);
customElements.define('note-card', NoteCard);
customElements.define('note-form', NoteForm);
