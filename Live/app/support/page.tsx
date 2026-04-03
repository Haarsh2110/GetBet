'use client';

import { Send, PlusCircle, Phone, MessageSquare, ChevronRight, HeadphonesIcon, Clock, Star } from 'lucide-react';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  id: number;
  role: 'agent' | 'user';
  text: string;
  time: string;
}

const quickReplies = [
  'Deposit issue',
  'Withdrawal status',
  'VIP upgrade',
  'Bet settlement',
];

const agentResponses = [
  "I understand your concern. Let me check that for you right away.",
  "Your account is fully verified and active. Is there anything else I can help you with?",
  "I've escalated this to our senior team. You'll hear back within 2 hours.",
  "Your withdrawal has been processed and should reflect within 24 hours.",
  "We're offering a special VIP bonus today — would you like to know more?",
];

export default function Support() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'agent',
      text: "Welcome back, VIP Member! 👑 I'm your dedicated support agent. How can I assist you today?",
      time: '10:23 AM',
    },
    {
      id: 2,
      role: 'user',
      text: "I need the latest injury report for the Chelsea match before I lock this in.",
      time: '10:25 AM',
    },
    {
      id: 3,
      role: 'agent',
      text: "Of course! Our AI has analysed 6 injury confirmations for Chelsea. Azpilicueta is out, Chilwell is doubtful. Shall I factor this into your bet strategy?",
      time: '10:26 AM',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text, time: now }]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const reply = agentResponses[Math.floor(Math.random() * agentResponses.length)];
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'agent',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    }, 1800);
  };

  return (
    <div className="flex flex-col min-h-full bg-[#0A0A0A] overflow-hidden">
      {/* Header */}
      <header className="px-5 pt-10 pb-3 shrink-0 border-b border-white/5 bg-[#0A0A0A]">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-0.5">24/7</p>
            <h1 className="text-lg font-black text-white">VIP Support</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 bg-[#facc15]/10 border border-[#facc15]/30 rounded-xl flex items-center justify-center active:scale-95 transition">
              <Phone size={15} className="text-[#facc15]" />
            </button>
            <button className="w-9 h-9 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center active:scale-95 transition">
              <MessageSquare size={15} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Agent Info Bar */}
        <div className="bg-[#111111] border border-white/5 rounded-2xl px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-8 h-8 rounded-full border border-[#facc15]/30 overflow-hidden">
                <Image src="https://picsum.photos/seed/agent/100/100" alt="Agent" width={32} height={32} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#0A0A0A] rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </div>
            </div>
            <div>
              <p className="text-white text-xs font-bold">Senior VIP Agent</p>
              <p className="text-green-500 text-[9px] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />
                Online now
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <div className="flex items-center gap-1">
              <Clock size={10} />
              <span className="text-[9px]">&lt;2 min</span>
            </div>
            <div className="flex items-center gap-1">
              <Star size={10} className="text-[#facc15]" fill="#facc15" />
              <span className="text-[9px] text-gray-400">4.9</span>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 flex flex-col gap-4">
        <p className="text-center text-[10px] font-bold text-gray-700 uppercase tracking-widest">Today</p>

        {messages.map((msg, i) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-end gap-2.5 ${msg.role === 'user' ? 'justify-end' : ''}`}
          >
            {msg.role === 'agent' && (
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-full border border-[#facc15]/30 overflow-hidden">
                  <Image src="https://picsum.photos/seed/agent/100/100" alt="Agent" width={32} height={32} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              </div>
            )}
            <div className={`flex flex-col gap-1 max-w-[80%] ${msg.role === 'user' ? 'items-end' : ''}`}>
              <span className="text-[9px] text-gray-600 px-1">
                {msg.role === 'agent' ? 'VIP Agent' : 'You'} · {msg.time}
              </span>
              <div
                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'agent'
                    ? 'bg-[#1A1A1A] border border-white/5 text-gray-200 rounded-bl-sm'
                    : 'text-black font-medium rounded-br-sm'
                  }`}
                style={msg.role === 'user' ? { background: 'linear-gradient(135deg, #D4AF37 0%, #B08D26 100%)' } : {}}
              >
                {msg.text}
              </div>
            </div>
          </motion.div>
        ))}

        {/* Typing indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-end gap-2.5"
            >
              <div className="w-8 h-8 rounded-full border border-[#facc15]/30 overflow-hidden shrink-0">
                <Image src="https://picsum.photos/seed/agent/100/100" alt="Agent" width={32} height={32} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="bg-[#1A1A1A] border border-white/5 px-4 py-3 rounded-2xl rounded-bl-sm h-11 flex items-center gap-1">
                {[0, 150, 300].map((delay, i) => (
                  <div key={i} className="w-1.5 h-1.5 bg-[#facc15]/50 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </main>

      {/* Quick Replies */}
      <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
        {quickReplies.map(q => (
          <button
            key={q}
            onClick={() => sendMessage(q)}
            className="shrink-0 px-3 py-1.5 rounded-full bg-[#111111] border border-white/10 text-gray-400 text-[10px] font-bold whitespace-nowrap active:border-[#facc15]/40 active:text-[#facc15] transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="shrink-0 bg-[#0A0A0A] border-t border-white/5 px-4 py-3 pb-[90px]">
        <div className="flex items-center gap-2">
          <button className="text-gray-600 hover:text-[#facc15] transition-colors">
            <PlusCircle size={22} />
          </button>
          <div className="flex-1 bg-[#111111] border border-white/10 focus-within:border-[#facc15]/40 rounded-2xl px-4 py-2.5 flex items-center transition-colors">
            <input
              className="bg-transparent border-none outline-none text-white placeholder-gray-600 text-sm w-full focus:ring-0 p-0"
              placeholder="Type a message..."
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
            />
          </div>
          <button
            onClick={() => sendMessage(input)}
            className="w-10 h-10 rounded-xl flex items-center justify-center active:scale-95 transition-all"
            style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #B08D26 100%)' }}
          >
            <Send size={16} className="text-black" />
          </button>
        </div>
      </div>
    </div>
  );
}
