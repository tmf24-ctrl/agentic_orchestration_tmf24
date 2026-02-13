// Command configurations
const commandConfigs = {
    hello: {
        icon: '👋',
        label: 'Hello',
        fields: [
            { name: 'message', label: 'Message', type: 'text', placeholder: 'Enter your message', required: false, default: 'Hello from CLI' }
        ]
    },
    'web-search': {
        icon: '🔍',
        label: 'Web Search',
        fields: [
            { name: 'query', label: 'Search Query', type: 'text', placeholder: 'Search the web...', required: true }
        ]
    },
    gemini: {
        icon: '💬',
        label: 'Gemini AI',
        fields: [
            { name: 'prompt', label: 'Prompt', type: 'textarea', placeholder: 'Ask Gemini anything...', required: true },
            { name: 'file', label: 'Image File (optional)', type: 'text', placeholder: 'Path to image file', required: false }
        ]
    },
    'image-generate': {
        icon: '🎨',
        label: 'Generate Image',
        fields: [
            { name: 'prompt', label: 'Image Description', type: 'textarea', placeholder: 'Describe the image you want to create...', required: true },
            { name: 'size', label: 'Size', type: 'text', placeholder: '512x512 or 1024x1024', default: '1024x1024', required: false },
            { name: 'n', label: 'Number of Images', type: 'number', placeholder: '1-10', default: '1', required: false },
            { name: 'model', label: 'Model', type: 'text', placeholder: 'dall-e-2 or dall-e-3', default: 'dall-e-3', required: false }
        ]
    },
    'text-analyze': {
        icon: '📊',
        label: 'Analyze Text',
        fields: [
            { name: 'text', label: 'Text to Analyze', type: 'textarea', placeholder: 'Paste your text here...', required: true }
        ]
    },
    'web-research': {
        icon: '🔬',
        label: 'Web Research',
        fields: [
            { name: 'query', label: 'Research Topic', type: 'textarea', placeholder: 'What do you want to research?', required: true }
        ]
    },
    'website-screenshot': {
        icon: '📸',
        label: 'Screenshot',
        fields: [
            { name: 'url', label: 'Website URL', type: 'text', placeholder: 'https://example.com', required: true },
            { name: 'viewport', label: 'Viewport Size', type: 'text', placeholder: '1920x1080', default: '1920x1080', required: false },
            { name: 'fullpage', label: 'Full Page', type: 'checkbox', required: false },
            { name: 'delay', label: 'Delay (ms)', type: 'number', placeholder: '1000', default: '1000', required: false }
        ]
    }
};

let currentCommand = null;

// Initialize the app
async function init() {
    await loadCommands();
    loadFiles();
    setupEventListeners();
    
    // Set default command
    selectCommand('hello');
    
    // Refresh files every 5 seconds
    setInterval(loadFiles, 5000);
}

// Load and display available commands
async function loadCommands() {
    try {
        const response = await fetch('/api/commands');
        const commands = await response.json();
        
        const buttonsContainer = document.getElementById('commandButtons');
        buttonsContainer.innerHTML = '';
        
        commands.forEach(cmd => {
            const config = commandConfigs[cmd.name];
            if (!config) return;
            
            const button = document.createElement('button');
            button.className = 'cmd-btn';
            button.dataset.command = cmd.name;
            button.title = cmd.description;
            button.innerHTML = `
                <span class="icon">${config.icon}</span>
                <span class="label">${config.label}</span>
            `;
            
            button.addEventListener('click', () => selectCommand(cmd.name));
            buttonsContainer.appendChild(button);
        });
    } catch (error) {
        console.error('Error loading commands:', error);
        showStatus('Failed to load commands', 'error');
    }
}

// Select a command
function selectCommand(command) {
    // Update current command
    currentCommand = command;
    
    // Update active button
    document.querySelectorAll('.cmd-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.command === command);
    });
    
    // Render input fields
    renderInputFields(command);
    
    // Clear previous output
    document.getElementById('output').classList.add('hidden');
    document.getElementById('status').classList.add('hidden');
}

// Render input fields based on command
function renderInputFields(command) {
    const config = commandConfigs[command];
    if (!config) return;
    
    const container = document.getElementById('inputFields');
    container.innerHTML = '';
    
    config.fields.forEach(field => {
        const group = document.createElement('div');
        group.className = 'input-group';
        
        if (field.type === 'checkbox') {
            group.innerHTML = `
                <label>
                    <input type="checkbox" name="${field.name}">
                    ${field.label}
                </label>
            `;
        } else {
            const inputElement = field.type === 'textarea' ? 'textarea' : 'input';
            group.innerHTML = `
                <label>${field.label}${field.required ? ' *' : ''}</label>
                <${inputElement} 
                    type="${field.type === 'textarea' ? 'text' : field.type}"
                    name="${field.name}"
                    placeholder="${field.placeholder || ''}"
                    value="${field.default || ''}"
                    ${field.required ? 'required' : ''}
                />
            `;
        }
        
        container.appendChild(group);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Execute button
    document.getElementById('executeBtn').addEventListener('click', executeCommand);
    
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tab = e.target.dataset.tab;
            switchTab(tab);
        });
    });
    
    // Modal close
    document.querySelector('.close').addEventListener('click', () => {
        document.getElementById('imageModal').style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('imageModal');
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Execute command
async function executeCommand() {
    if (!currentCommand) {
        showStatus('Please select a command', 'error');
        return;
    }
    
    // Gather form data
    const config = commandConfigs[currentCommand];
    const args = {};
    
    for (const field of config.fields) {
        const input = document.querySelector(`[name="${field.name}"]`);
        if (!input) continue;
        
        let value;
        if (field.type === 'checkbox') {
            value = input.checked;
        } else if (field.type === 'number') {
            value = input.value ? parseInt(input.value) : undefined;
        } else {
            value = input.value;
        }
        
        if (value !== undefined && value !== '') {
            args[field.name] = value;
        }
    }
    
    // Validate required fields
    for (const field of config.fields) {
        if (field.required && !args[field.name]) {
            showStatus(`${field.label} is required`, 'error');
            return;
        }
    }
    
    // Execute
    showStatus(`Executing ${currentCommand}...`, 'loading');
    document.getElementById('executeBtn').disabled = true;
    
    try {
        const response = await fetch('/api/execute', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                command: currentCommand,
                args: args
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            showStatus(`Error: ${data.error}`, 'error');
            console.error('Command error:', data);
            return;
        }
        
        showStatus(`✓ ${currentCommand} completed successfully`, 'success');
        
        // Display result
        const output = document.getElementById('output');
        const outputContent = document.getElementById('outputContent');
        
        if (data.result) {
            outputContent.textContent = typeof data.result === 'string' 
                ? data.result 
                : JSON.stringify(data.result, null, 2);
            output.classList.remove('hidden');
        }
        
        // Refresh files list
        setTimeout(loadFiles, 1000);
        
    } catch (error) {
        showStatus(`Error: ${error.message}`, 'error');
        console.error('Execution error:', error);
    } finally {
        document.getElementById('executeBtn').disabled = false;
    }
}

// Load and display files
async function loadFiles() {
    try {
        const response = await fetch('/api/files');
        const data = await response.json();
        
        // Update image count
        document.getElementById('imageCount').textContent = data.images.length;
        document.getElementById('refCount').textContent = data.references.length;
        
        // Display images
        const imagesList = document.getElementById('imagesList');
        if (data.images.length > 0) {
            imagesList.innerHTML = data.images.map(img => `
                <div class="file-item" onclick="previewImage('${img.path}')">
                    <img src="${img.path}" alt="${img.name}" class="file-thumbnail" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%231e293b%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23cbd5e1%22 font-family=%22Arial%22%3EImage%3C/text%3E%3C/svg%3E'">
                    <div class="file-info">
                        <div class="file-name">${truncateFilename(img.name)}</div>
                        <div class="file-size">${formatFileSize(img.size)}</div>
                    </div>
                </div>
            `).join('');
        } else {
            imagesList.innerHTML = '<p style="color: var(--text-secondary); grid-column: 1/-1;">No images generated yet</p>';
        }
        
        // Display references
        const referencesList = document.getElementById('referencesList');
        if (data.references.length > 0) {
            referencesList.innerHTML = data.references.map(ref => `
                <div class="file-item-list" onclick="downloadFile('${ref.path}')">
                    <div class="file-details">
                        <div class="file-details-name">📄 ${truncateFilename(ref.name, 50)}</div>
                        <div class="file-details-size">${formatFileSize(ref.size)}</div>
                    </div>
                    <button class="download-btn">Download</button>
                </div>
            `).join('');
        } else {
            referencesList.innerHTML = '<p style="color: var(--text-secondary);">No reference files yet</p>';
        }
        
    } catch (error) {
        console.error('Error loading files:', error);
    }
}

// Switch tabs
function switchTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    
    // Update tab panels
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    document.getElementById(`${tab}-tab`).classList.add('active');
}

// Show status message
function showStatus(message, type) {
    const status = document.getElementById('status');
    status.className = `status ${type}`;
    
    if (type === 'loading') {
        status.innerHTML = `<span class="spinner"></span>${message}`;
    } else if (type === 'success') {
        status.innerHTML = `<span style="font-size: 1.2em;">✓</span>${message}`;
    } else {
        status.innerHTML = `<span style="font-size: 1.2em;">✕</span>${message}`;
    }
    
    status.classList.remove('hidden');
    
    if (type !== 'loading') {
        setTimeout(() => {
            status.classList.add('hidden');
        }, 5000);
    }
}

// Preview image in modal
function previewImage(path) {
    const modal = document.getElementById('imageModal');
    const img = document.getElementById('modalImage');
    img.src = path;
    modal.style.display = 'block';
}

// Download file
function downloadFile(path) {
    const link = document.createElement('a');
    link.href = path;
    link.download = path.split('/').pop();
    link.click();
}

// Utility functions
function truncateFilename(filename, maxLength = 30) {
    if (filename.length <= maxLength) return filename;
    const ext = filename.split('.').pop();
    const name = filename.slice(0, maxLength - ext.length - 4);
    return `${name}...${ext}`;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', init);
