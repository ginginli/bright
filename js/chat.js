/**
 * Bridger Western Wiki — AI Chat Widget
 * Connects to Cloudflare Worker which calls Gemini API
 */

(function () {
  // ── Config ──────────────────────────────────────────────
  const WORKER_URL = 'https://bridger-western-chat.bridgerwestern.workers.dev';
  // Replace above with your actual Worker URL after deployment

  // ── Inject CSS ──────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #bw-chat-btn {
      position: fixed;
      bottom: 96px;
      right: 24px;
      height: 44px;
      padding: 0 16px;
      border-radius: 22px;
      background: #8B4513;
      color: white;
      border: none;
      cursor: pointer;
      font-size: 14px;
      font-weight: bold;
      font-family: 'Lora', Georgia, serif;
      box-shadow: 0 4px 16px rgba(0,0,0,0.4);
      z-index: 9998;
      display: flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
      transition: transform 0.2s, background 0.2s;
    }
    #bw-chat-btn:hover { background: #a0522d; transform: scale(1.05); }

    #bw-chat-window {
      position: fixed;
      bottom: 164px;
      right: 24px;
      width: 360px;
      max-width: calc(100vw - 32px);
      height: 480px;
      max-height: calc(100vh - 120px);
      background: #1a1008;
      border: 1px solid #5a3a1a;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.6);
      display: flex;
      flex-direction: column;
      z-index: 9999;
      overflow: hidden;
      font-family: 'Lora', Georgia, serif;
      transition: opacity 0.2s, transform 0.2s;
    }
    #bw-chat-window.hidden {
      opacity: 0;
      pointer-events: none;
      transform: translateY(12px);
    }

    #bw-chat-header {
      background: #5a3a1a;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
    }
    #bw-chat-header span {
      color: #f5deb3;
      font-weight: bold;
      font-size: 0.95rem;
    }
    #bw-chat-close {
      background: none;
      border: none;
      color: #f5deb3;
      cursor: pointer;
      font-size: 18px;
      line-height: 1;
      padding: 0 4px;
    }

    #bw-chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      scrollbar-width: thin;
      scrollbar-color: #5a3a1a transparent;
    }

    .bw-msg {
      max-width: 85%;
      padding: 10px 14px;
      border-radius: 10px;
      font-size: 0.88rem;
      line-height: 1.5;
      word-break: break-word;
    }
    .bw-msg a { color: #f5a623; }
    .bw-msg-user {
      background: #5a3a1a;
      color: #f5deb3;
      align-self: flex-end;
      border-bottom-right-radius: 2px;
    }
    .bw-msg-bot {
      background: #2a1a08;
      color: #e8d5b0;
      align-self: flex-start;
      border: 1px solid #3a2a10;
      border-bottom-left-radius: 2px;
    }
    .bw-msg-typing {
      color: #a08060;
      font-style: italic;
      font-size: 0.82rem;
    }

    #bw-chat-input-row {
      display: flex;
      gap: 8px;
      padding: 12px;
      border-top: 1px solid #3a2a10;
      flex-shrink: 0;
    }
    #bw-chat-input {
      flex: 1;
      background: #2a1a08;
      border: 1px solid #5a3a1a;
      border-radius: 6px;
      color: #f5deb3;
      padding: 8px 12px;
      font-size: 0.88rem;
      font-family: inherit;
      resize: none;
      outline: none;
      max-height: 80px;
    }
    #bw-chat-input::placeholder { color: #7a5a3a; }
    #bw-chat-input:focus { border-color: #8B4513; }
    #bw-chat-send {
      background: #8B4513;
      border: none;
      border-radius: 6px;
      color: white;
      padding: 8px 14px;
      cursor: pointer;
      font-size: 16px;
      transition: background 0.2s;
      align-self: flex-end;
    }
    #bw-chat-send:hover { background: #a0522d; }
    #bw-chat-send:disabled { background: #4a2a0a; cursor: not-allowed; }

    #bw-chat-footer {
      text-align: center;
      font-size: 0.7rem;
      color: #5a4a3a;
      padding: 4px 12px 8px;
      flex-shrink: 0;
    }
  `;
  document.head.appendChild(style);

  // ── Build HTML ───────────────────────────────────────────
  const btn = document.createElement('button');
  btn.id = 'bw-chat-btn';
  btn.setAttribute('aria-label', 'Open wiki assistant');
  btn.innerHTML = '✨ AI Assistant';

  const win = document.createElement('div');
  win.id = 'bw-chat-window';
  win.classList.add('hidden');
  win.setAttribute('role', 'dialog');
  win.setAttribute('aria-label', 'Bridger Western Wiki Assistant');
  win.innerHTML = `
    <div id="bw-chat-header">
      <span>🤠 Wiki Assistant</span>
      <button id="bw-chat-close" aria-label="Close chat">✕</button>
    </div>
    <div id="bw-chat-messages" aria-live="polite"></div>
    <div id="bw-chat-input-row">
      <textarea id="bw-chat-input" placeholder="Ask anything about Bridger Western..." rows="1" maxlength="500"></textarea>
      <button id="bw-chat-send" aria-label="Send">➤</button>
    </div>
    <div id="bw-chat-footer">Powered by Gemini · Based on wiki content</div>
  `;

  document.body.appendChild(btn);
  document.body.appendChild(win);

  // ── State ────────────────────────────────────────────────
  const messagesEl = document.getElementById('bw-chat-messages');
  const inputEl = document.getElementById('bw-chat-input');
  const sendBtn = document.getElementById('bw-chat-send');
  let isOpen = false;
  let isLoading = false;
  let greeted = false;

  // ── Helpers ──────────────────────────────────────────────
  function addMessage(text, type) {
    const div = document.createElement('div');
    div.className = `bw-msg bw-msg-${type}`;
    // Convert markdown-style links and bold
    div.innerHTML = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')
      .replace(/\n/g, '<br>');
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }

  function setLoading(loading) {
    isLoading = loading;
    sendBtn.disabled = loading;
    inputEl.disabled = loading;
  }

  // ── Toggle ───────────────────────────────────────────────
  function openChat() {
    isOpen = true;
    win.classList.remove('hidden');
    btn.innerHTML = '✕';
    inputEl.focus();
    if (!greeted) {
      greeted = true;
      addMessage("Hey! I'm your Bridger Western Wiki assistant 🤠\nAsk me anything about stands, weapons, locations, cards, fishing, and more!", 'bot');
    }
  }

  function closeChat() {
    isOpen = false;
    win.classList.add('hidden');
    btn.innerHTML = '✨ AI Assistant';
  }

  btn.addEventListener('click', () => isOpen ? closeChat() : openChat());
  document.getElementById('bw-chat-close').addEventListener('click', closeChat);

  // ── Send message ─────────────────────────────────────────
  async function sendMessage() {
    const text = inputEl.value.trim();
    if (!text || isLoading) return;

    inputEl.value = '';
    inputEl.style.height = 'auto';
    addMessage(text, 'user');
    setLoading(true);

    const typingEl = addMessage('Thinking...', 'bot bw-msg-typing');

    // Track in GA4
    if (typeof gtag !== 'undefined') {
      gtag('event', 'chat_question', {
        event_category: 'wiki_assistant',
        event_label: text.slice(0, 100)
      });
    }

    try {
      const res = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });

      const data = await res.json();
      typingEl.remove();

      if (data.error) {
        addMessage('⚠️ ' + data.error, 'bot');
      } else {
        addMessage(data.answer, 'bot');
      }
    } catch (e) {
      typingEl.remove();
      addMessage('⚠️ Connection error. Please try again.', 'bot');
    }

    setLoading(false);
    inputEl.focus();
  }

  sendBtn.addEventListener('click', sendMessage);
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Auto-resize textarea
  inputEl.addEventListener('input', () => {
    inputEl.style.height = 'auto';
    inputEl.style.height = Math.min(inputEl.scrollHeight, 80) + 'px';
  });

})();
