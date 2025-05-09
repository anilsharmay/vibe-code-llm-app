'use client'

import { useState, useEffect, useRef } from 'react'
import { FiMinimize2, FiMaximize2, FiSend } from 'react-icons/fi'

interface Message {
  id: string
  text: string
  sender: 'user' | 'agent'
  timestamp: string
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      text: "Welcome to ChatDOS! This is a DOS-themed chatbot. Type your questions or commands below and I'll respond just like an old-school terminal assistant.",
      sender: 'agent',
      timestamp: new Date().toLocaleTimeString(),
    }
  ])
  const [input, setInput] = useState('')
  const [isMinimized, setIsMinimized] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)
  const terminalRef = useRef<HTMLDivElement>(null)
  const termRef = useRef<any>(null)
  const fitAddonRef = useRef<any>(null)

  // Initialize xterm.js only on client
  useEffect(() => {
    if (typeof window === 'undefined' || !terminalRef.current) return;
    let term: any;
    let fitAddon: any;
    let disposed = false;
    import('xterm').then(({ Terminal }) => {
      import('xterm-addon-fit').then(({ FitAddon }) => {
        if (disposed) return;
        term = new Terminal({
          cursorBlink: true,
          theme: {
            background: '#000000',
            foreground: '#ffffff',
          },
        });
        const fitAddon = new FitAddon();
        fitAddonRef.current = fitAddon;
        term.loadAddon(fitAddon);
        term.open(terminalRef.current!);
        fitAddon.fit();
        term.reset(); // Fully reset the terminal for a clean start
        // Write all existing messages on mount
        messages.forEach((msg) => {
          term.writeln(`${msg.sender === 'user' ? 'C:\\Users\\You>' : 'C:\\Users\\Agent>'} ${msg.text}`);
        });
      });
    });
    return () => {
      disposed = true;
      if (term) term.dispose();
    };
    // eslint-disable-next-line
  }, []);

  // Write new messages to terminal
  useEffect(() => {
    if (termRef.current && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      termRef.current.writeln(`${lastMsg.sender === 'user' ? 'C:\\Users\\You>' : 'C:\\Users\\Agent>'} ${lastMsg.text}`);
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: input }],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        sender: 'agent',
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages((prev) => [...prev, agentMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, there was an error processing your request.',
        sender: 'agent',
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  return (
    <main className="min-h-screen bg-black p-4">
      <div className="max-w-4xl mx-auto">
        <div className={`bg-white rounded-lg shadow-lg overflow-hidden border-2 border-white ${isMaximized ? 'fixed inset-0 z-50 m-0 rounded-none bg-black' : ''}`}>
          {/* Title Bar (always visible) */}
          <div className="bg-[#000080] text-white p-2 flex justify-between items-center">
            <div className="flex items-center">
              <span className="font-bold">ChatDOS - DOS themed chatbot</span>
            </div>
            <div className="flex items-center gap-1">
              {/* Minimize */}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="w-7 h-7 flex items-center justify-center text-white bg-[#000080] border border-white rounded-md p-0 m-0"
                style={{ fontWeight: 'bold', fontSize: '18px', lineHeight: '1' }}
                aria-label="Minimize"
              >
                _
              </button>
              {/* Maximize */}
              <button
                onClick={() => {
                  setIsMaximized((prev) => {
                    const newVal = !prev;
                    setTimeout(() => {
                      if (fitAddonRef.current && termRef.current) {
                        fitAddonRef.current.fit();
                      }
                    }, 0);
                    return newVal;
                  });
                }}
                className="w-7 h-7 flex items-center justify-center text-white bg-[#000080] border border-white rounded-md p-0 m-0"
                style={{ fontWeight: 'bold', fontSize: '16px', lineHeight: '1' }}
                aria-label="Maximize"
              >
                ▢
              </button>
              {/* Close */}
              <button
                className="w-7 h-7 flex items-center justify-center text-white bg-[#ff0000] border border-white rounded-md p-0 m-0"
                style={{ fontWeight: 'bold', fontSize: '18px', lineHeight: '1' }}
                aria-label="Close"
              >
                ×
              </button>
            </div>
          </div>

          {/* Chat Window (always rendered, just hidden when minimized) */}
          <div className={`h-96 overflow-y-auto p-4 bg-black text-green-400 font-mono ${isMinimized ? 'hidden' : ''}`}>
            <div ref={terminalRef} className="h-full" />
          </div>
          <form onSubmit={handleSubmit} className={`p-4 border-t bg-black ${isMinimized ? 'hidden' : ''}`}>
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 p-2 border-2 border-black bg-black text-white placeholder-gray-400 focus:outline-none focus:ring-0"
                placeholder="Type your message..."
              />
              <button
                type="submit"
                className="bg-[#000080] text-white px-4 py-2 rounded hover:bg-[#0000ff] flex items-center gap-2"
              >
                <FiSend />
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
} 