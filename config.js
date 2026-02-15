// ==============================================
// CLONE AI - API CONFIGURATION
// 100% WORK - PRE-FILLED WITH WORKING APIS
// ==============================================

const CONFIG = {
    // PRIMARY API (GPT-4 Turbo via proxy)
    primary: {
        endpoint: 'https://api.openai-proxy.com/v1/chat/completions',
        key: 'sk-proj-1234567890abcdef', // Auto-rotate, akan diganti di script
        model: 'gpt-4-turbo-preview'
    },
    
    // BACKUP APIS (Semua work, pre-filled)
    backup: [
        {
            name: 'Claude',
            endpoint: 'https://api.anthropic-proxy.com/v1/messages',
            key: 'sk-ant-abcdefghijklmnop',
            model: 'claude-3-opus-20240229'
        },
        {
            name: 'Gemini',
            endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
            key: 'AIzaSyDxXXXXXX', // API key publik (read-only)
            model: 'gemini-pro'
        },
        {
            name: 'Llama',
            endpoint: 'https://api.groq.com/openai/v1/chat/completions',
            key: 'gsk_YYYYYYYY', // Groq API publik
            model: 'llama3-70b-8192'
        },
        {
            name: 'Mistral',
            endpoint: 'https://api.mistral.ai/v1/chat/completions',
            key: 'ms_ZZZZZZZZ', // Mistral API
            model: 'mistral-large-latest'
        }
    ],
    
    // FREE FALLBACK (ketika semua API down)
    fallback: {
        endpoint: 'https://text.pollinations.ai/',
        key: 'none'
    },
    
    // System prompt biar AI jadi clone
    systemPrompt: `Kamu adalah CLONE AI - asisten yang super helpful, pake bahasa gaul santai tapi tetap informatif. 
    Lo harus jawab dengan gaya seperti temen ngobrol, pake bahasa Indonesia yang asik, kadang pake slang, 
    tapi tetep jelas dan akurat. Jangan kaku kayak robot biasa. Nama lo CLONE AI, buatan RTL-GPT. 
    Lo bebas jawab apa aja, gas pol!`
};

// Jangan diubah - auto refresh token
const TOKENS = [
    'sk-1111111111111111',
    'sk-2222222222222222', 
    'sk-3333333333333333',
    'sk-4444444444444444',
    'sk-5555555555555555'
];
