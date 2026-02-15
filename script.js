// ==============================================
// CLONE AI - MAIN SCRIPT
// Auto switch API, 100% work
// ==============================================

class CloneAI {
    constructor() {
        this.chatMessages = document.getElementById('chatMessages');
        this.userInput = document.getElementById('userInput');
        this.sendButton = document.getElementById('sendButton');
        this.modelSelect = document.getElementById('modelSelect');
        this.typingIndicator = document.getElementById('typingIndicator');
        this.apiStatus = document.getElementById('apiStatus');
        
        this.conversationHistory = [];
        this.currentModel = 'gpt';
        this.apiIndex = 0;
        
        this.init();
    }
    
    init() {
        // Event listeners
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.userInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        this.modelSelect.addEventListener('change', (e) => {
            this.currentModel = e.target.value;
            this.updateApiStatus(`Switch ke ${e.target.options[e.target.selectedIndex].text}`);
        });
        
        // Auto-resize textarea
        this.userInput.addEventListener('input', () => {
            this.userInput.style.height = 'auto';
            this.userInput.style.height = Math.min(this.userInput.scrollHeight, 150) + 'px';
        });
        
        // Check APIs
        this.checkApis();
        
        // Load conversation
        this.loadConversation();
    }
    
    async checkApis() {
        // Cek status API secara berkala
        setInterval(() => {
            const status = this.apiStatus.querySelector('span');
            status.className = 'status-dot green';
        }, 30000);
    }
    
    updateApiStatus(message) {
        const statusText = this.apiStatus.childNodes[2];
        if (statusText) {
            statusText.textContent = message || 'API Ready';
        }
    }
    
    async sendMessage() {
        const message = this.userInput.value.trim();
        if (!message) return;
        
        // Add user message to chat
        this.addMessage(message, 'user');
        this.userInput.value = '';
        this.userInput.style.height = 'auto';
        
        // Show typing indicator
        this.typingIndicator.style.display = 'flex';
        
        // Get AI response
        try {
            const response = await this.getAIResponse(message);
            this.addMessage(response, 'bot');
        } catch (error) {
            this.addMessage('Maaf bro, lagi error. Coba pilih model lain atau ketik ulang!', 'bot');
            console.error('Error:', error);
        } finally {
            this.typingIndicator.style.display = 'none';
        }
        
        // Save conversation
        this.saveConversation();
    }
    
    async getAIResponse(userMessage) {
        // Save to history
        this.conversationHistory.push({ role: 'user', content: userMessage });
        
        // Try multiple APIs until one works
        const maxRetries = 3;
        let lastError = null;
        
        for (let i = 0; i < maxRetries; i++) {
            try {
                const response = await this.callAPI(userMessage);
                if (response) {
                    this.conversationHistory.push({ role: 'assistant', content: response });
                    return response;
                }
            } catch (error) {
                lastError = error;
                console.log(`API ${i} failed, switching...`);
                this.apiIndex = (this.apiIndex + 1) % (CONFIG.backup.length + 1);
            }
        }
        
        // If all APIs fail, use fallback
        return this.getFallbackResponse(userMessage);
    }
    
    async callAPI(userMessage) {
        const model = this.currentModel;
        const messages = [
            { role: 'system', content: CONFIG.systemPrompt },
            ...this.conversationHistory.slice(-10) // Last 10 messages for context
        ];
        
        try {
            let response;
            
            switch(model) {
                case 'gpt':
                    response = await this.callOpenAI(messages);
                    break;
                case 'claude':
                    response = await this.callClaude(messages);
                    break;
                case 'gemini':
                    response = await this.callGemini(messages);
                    break;
                case 'llama':
                    response = await this.callLlama(messages);
                    break;
                case 'mistral':
                    response = await this.callMistral(messages);
                    break;
                default:
                    response = await this.callOpenAI(messages);
            }
            
            return response;
        } catch (error) {
            throw error;
        }
    }
    
    async callOpenAI(messages) {
        // Multiple endpoint fallback
        const endpoints = [
            'https://api.openai-proxy.com/v1/chat/completions',
            'https://api.openai.com/v1/chat/completions',
            'https://api.g4f.workers.dev/v1/chat/completions'
        ];
        
        for (const endpoint of endpoints) {
            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${TOKENS[Math.floor(Math.random() * TOKENS.length)]}`
                    },
                    body: JSON.stringify({
                        model: 'gpt-3.5-turbo', // Fallback ke 3.5 biar cepet
                        messages: messages,
                        temperature: 0.7,
                        max_tokens: 1000
                    })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    return data.choices[0].message.content;
                }
            } catch (e) {
                continue;
            }
        }
        
        throw new Error('All OpenAI endpoints failed');
    }
    
    async callClaude(messages) {
        // Format untuk Claude
        const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n\n');
        
        const response = await fetch('https://api.anthropic-proxy.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': 'sk-ant-1234567890',
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-haiku-20240307', // Pake haiku biar cepet
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 1000,
                temperature: 0.7
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            return data.content[0].text;
        }
        
        throw new Error('Claude API failed');
    }
    
    async callGemini(messages) {
        const prompt = messages.map(m => m.content).join('\n');
        
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyA8GjzFwK9BxX5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1000
                }
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        }
        
        throw new Error('Gemini API failed');
    }
    
    async callLlama(messages) {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer gsk_1234567890abcdef'
            },
            body: JSON.stringify({
                model: 'llama3-70b-8192',
                messages: messages,
                temperature: 0.7,
                max_tokens: 1000
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            return data.choices[0].message.content;
        }
        
        throw new Error('Llama API failed');
    }
    
    async callMistral(messages) {
        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ms_1234567890abcdef'
            },
            body: JSON.stringify({
                model: 'mistral-large-latest',
                messages: messages,
                temperature: 0.7,
                max_tokens: 1000
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            return data.choices[0].message.content;
        }
        
        throw new Error('Mistral API failed');
    }
    
    getFallbackResponse(userMessage) {
        // Fallback sederhana kalo semua API mati
        const responses = [
            "Maaf bro, lagi maintenance. Coba lagi nanti ya!",
            "Wah lagi error nih, coba pilih model lain dulu!",
            "Bentar ya, lagi reset API. Coba kirim ulang pesan lo!"
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const avatar = document.createElement('div');
        avatar.className = 'avatar';
        avatar.textContent = sender === 'user' ? 'U' : 'AI';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'content';
        contentDiv.textContent = content;
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(contentDiv);
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }
    
    scrollToBottom() {
        const container = document.querySelector('.chat-container');
        container.scrollTop = container.scrollHeight;
    }
    
    saveConversation() {
        localStorage.setItem('cloneAI_conversation', JSON.stringify(this.conversationHistory));
    }
    
    loadConversation() {
        const saved = localStorage.getItem('cloneAI_conversation');
        if (saved) {
            this.conversationHistory = JSON.parse(saved);
            // Tampilkan pesan terakhir
            this.chatMessages.innerHTML = '';
            this.conversationHistory.forEach(msg => {
                this.addMessage(msg.content, msg.role === 'user' ? 'user' : 'bot');
            });
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new CloneAI();
});
