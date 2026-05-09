import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Welcome to All Available. How may I assist you with your luxury selection today?' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setInput('');

    try {
      const res = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage })
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, { sender: 'bot', text: data.reply || data.message }]);
    } catch(err) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Network connection failed. Could not contact our concierge team.' }]);
    }
  };

  return (
    <div className="fixed bottom-[9.5rem] right-8 z-[1300]">
      {isOpen ? (
        <div className="w-[calc(100vw-2rem)] md:w-[350px] h-[min(70vh,450px)] flex flex-col rounded-2xl overflow-hidden glass-panel shadow-2xl animate-[fadeSlideUp_0.3s_ease-out] -mr-4 md:mr-0">
          <div className="p-4 bg-surface-container-low/80 border-b border-white/5 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[20px]">support_agent</span>
              <h4 className="font-headline-sm text-[16px] text-primary m-0">Concierge</h4>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-on-surface-variant hover:text-error transition-colors p-1 rounded-md hover:bg-error/10">
              <X size={20}/>
            </button>
          </div>
          <div className="flex-grow p-4 overflow-y-auto flex flex-col gap-4 no-scrollbar bg-background/40">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`p-3 rounded-xl max-w-[85%] font-body-md text-[14px] leading-relaxed shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-secondary text-on-secondary rounded-br-sm self-end' 
                    : 'bg-surface-container text-primary rounded-bl-sm self-start border border-white/5'
                }`}
              >
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form className="p-4 border-t border-white/5 bg-surface-container-lowest/80 flex items-center gap-2" onSubmit={handleSend}>
            <input 
              type="text" 
              placeholder="Message Concierge..." 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              className="flex-grow bg-transparent border-0 text-primary placeholder:text-on-surface-variant focus:ring-0 px-2 py-2 font-body-md text-[14px] outline-none"
            />
            <button type="submit" className="text-secondary hover:scale-110 transition-transform p-2">
              <Send size={18}/>
            </button>
          </form>
        </div>
      ) : (
        <button 
          className="w-[60px] h-[60px] rounded-full bg-surface-container-high border border-white/10 text-primary flex items-center justify-center shadow-xl hover:scale-110 hover:border-secondary hover:text-secondary hover:shadow-[0_0_20px_rgba(233,195,73,0.2)] transition-all duration-300" 
          onClick={() => setIsOpen(true)}
        >
          <MessageCircle size={26} />
        </button>
      )}
    </div>
  );
};

export default ChatWidget;
