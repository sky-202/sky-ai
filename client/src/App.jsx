import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  LogOut, 
  Plus, 
  Menu, 
  X, 
  User, 
  Bot, 
  Loader2,
  Sparkles
} from 'lucide-react';

// --- Constants ---
const API_URL = 'http://localhost:3000'; // Pointing to your backend

// --- Components ---

// 1. Loading Spinner
const Spinner = () => <Loader2 className="w-5 h-5 animate-spin" />;

// 2. Auth Page (Login & Signup)
const AuthPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading,XH] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    XH(true);

    const endpoint = isLogin ? '/auth/log-in' : '/auth/sign-up';
    
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        // Important: this allows the backend to set the httpOnly cookie
        credentials: 'include' 
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Something went wrong');

      // On success, pass the user object up
      if (data.success) {
        onLogin(data.data.user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      XH(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-sky-500 rounded-xl flex items-center justify-center">
              <Sparkles className="text-white w-6 h-6" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white text-center mb-2">
            Welcome to Sky AI
          </h2>
          <p className="text-slate-400 text-center mb-8">
            {isLogin ? 'Sign in to continue' : 'Create an account to get started'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
              <input
                type="email"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-600 hover:bg-sky-500 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center"
            >
              {loading ? <Spinner /> : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sky-400 hover:text-sky-300 text-sm font-medium"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. Main Chat Interface
const ChatApp = ({ user, onLogout }) => {
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);

  // Initial Fetch: Get all chats
  useEffect(() => {
    fetchChats();
  }, []);

  // Fetch messages when chat changes
  useEffect(() => {
    if (currentChatId) {
      fetchMessages(currentChatId);
    } else {
      setMessages([]);
    }
  }, [currentChatId]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchChats = async () => {
    try {
      const res = await fetch(`${API_URL}/chat/all`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setChats(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch chats", err);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const res = await fetch(`${API_URL}/message/chat/${chatId}`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setMessages(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch messages", err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const originalInput = input;
    setInput(''); // Clear input early
    setLoading(true);

    // Optimistically add user message for better UX
    const optimMessage = { role: 'USER', content: originalInput, id: 'optim-user' };
    setMessages(prev => [...prev, optimMessage]);

    try {
      let res;
      let data;

      if (!currentChatId) {
        // Create New Chat
        res = await fetch(`${API_URL}/chat/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: originalInput }),
          credentials: 'include'
        });
        data = await res.json();

        if (data.success) {
          const newChat = data.data;
          setChats(prev => [newChat, ...prev]);
          setCurrentChatId(newChat.id);
          
          // Since createChat (per backend logic) doesn't return messages in the 'data' root,
          // we should fetch them immediately or rely on the fact that your backend
          // logic generates a response. Let's fetch to be safe and get the AI response.
          await fetchMessages(newChat.id);
        }
      } else {
        // Send Message to Existing Chat
        res = await fetch(`${API_URL}/message/chat/${currentChatId}`, { // Wait, backend route is POST /chat/:id/message ??
          // Let's check the routes: chatRouter.post('/:id/message', ...)
          // And messageRouter?? No, let's look at chatRouter in backend.
          // chatRouter.post('/:id/message', createMessage)
          // Ah, actually let's use the route defined in chatRoute.ts
        });
        
        // Correct endpoint based on your provided backend files:
        // chatRouter: post('/:id/message', authorize, createMessage);
        res = await fetch(`${API_URL}/chat/${currentChatId}/message`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ message: originalInput }),
           credentials: 'include'
        });
        
        data = await res.json();

        if (data.success) {
            // The createMessage controller returns { userMessage, aiMessage } in data
            // We can just append them, or refetch. Appending is smoother.
            const userMsg = { role: 'USER', content: data.data.userMessage, id: Date.now() };
            const aiMsg = { role: 'ASSISTANT', content: data.data.aiMessage, id: Date.now() + 1 };
            
            // Filter out the optimistic message and add real ones
            setMessages(prev => [...prev.filter(m => m.id !== 'optim-user'), userMsg, aiMsg]);
        }
      }

    } catch (err) {
      console.error(err);
      // Revert optimistic update on error
      setMessages(prev => prev.filter(m => m.id !== 'optim-user'));
      alert("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/log-out`, { method: 'POST', credentials: 'include' });
      onLogout();
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:relative z-30 w-64 h-full bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sky-500 font-bold text-xl">
            <Sparkles className="w-12 h-16" />
            <span>Sky Ai</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4">
          <button 
            onClick={() => {
              setCurrentChatId(null);
              setIsSidebarOpen(false);
            }}
            className="w-full bg-sky-600 hover:bg-sky-500 text-white rounded-lg p-3 flex items-center justify-center gap-2 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">History</div>
          {chats.map(chat => (
            <button
              key={chat.id}
              onClick={() => {
                setCurrentChatId(chat.id);
                setIsSidebarOpen(false);
              }}
              className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${
                currentChatId === chat.id 
                  ? 'bg-slate-800 text-sky-400' 
                  : 'hover:bg-slate-800/50 text-slate-400'
              }`}
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span className="truncate text-sm">{chat.title}</span>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <div className="truncate max-w-[100px]">{user.name}</div>
            </div>
            <button 
              onClick={handleLogout} 
              className="text-slate-500 hover:text-red-400 transition-colors"
              title="Log out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full w-full">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-4 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-10">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden text-slate-400 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="text-center flex-1 md:text-left md:flex-none">
            <span className="font-medium text-slate-200">
               {currentChatId ? 'Chat Session' : 'New Conversation'}
            </span>
          </div>
          <div className="w-6 md:hidden"></div> {/* Spacer for alignment */}
        </header>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
              <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-sky-500" />
              </div>
              <h3 className="text-xl font-medium text-slate-200 mb-2">How can I help you today?</h3>
              <p className="text-sm text-slate-400 max-w-sm">
                I can help you analyze data, write code, or just have a conversation.
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isUser = msg.role === 'USER';
              return (
                <div 
                  key={idx} 
                  className={`flex gap-4 max-w-3xl mx-auto ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 bg-sky-600 rounded-full flex items-center justify-center shrink-0 mt-1">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}
                  
                  <div className={`
                    rounded-2xl p-4 max-w-[85%] md:max-w-[75%] leading-relaxed shadow-sm
                    ${isUser 
                      ? 'bg-slate-800 text-slate-100 rounded-tr-none' 
                      : 'bg-transparent border border-slate-800 text-slate-300 rounded-tl-none'
                    }
                  `}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>

                  {isUser && (
                    <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center shrink-0 mt-1">
                      <User className="w-5 h-5 text-slate-300" />
                    </div>
                  )}
                </div>
              );
            })
          )}
          {loading && (
            <div className="flex gap-4 max-w-3xl mx-auto">
               <div className="w-8 h-8 bg-sky-600 rounded-full flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-5 h-5 text-white" />
               </div>
               <div className="bg-transparent border border-slate-800 rounded-2xl rounded-tl-none p-4 flex items-center">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
                    <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
                    <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
                  </div>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-slate-950 border-t border-slate-800">
          <div className="max-w-3xl mx-auto relative">
            <form onSubmit={handleSendMessage}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message Sky AI..."
                className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl pl-4 pr-12 py-3.5 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none shadow-lg transition-all"
                disabled={loading}
              />
              <button 
                type="submit"
                disabled={!input.trim() || loading}
                className="absolute right-2 top-2 p-1.5 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
            <div className="text-center mt-2">
              <span className="text-[10px] text-slate-600">
                Sky AI can make mistakes. Consider checking important information.
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// 4. Root App Component
function App() {
  const [user, setUser] = useState(null);

  // Simple persistence using localStorage for demo purposes
  // In a real app, you might verify the token with /user/me endpoint
  useEffect(() => {
    const savedUser = localStorage.gmUser;
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.gmUser = JSON.stringify(userData);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('gmUser');
  };

  return (
    <>
      {user ? (
        <ChatApp user={user} onLogout={handleLogout} />
      ) : (
        <AuthPage onLogin={handleLogin} />
      )}
    </>
  );
}

export default App;