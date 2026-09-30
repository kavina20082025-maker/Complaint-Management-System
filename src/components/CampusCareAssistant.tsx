import React, { useState } from 'react';
import { Sparkles, Send, HelpCircle, BookOpen, ShieldCheck, ChevronRight } from 'lucide-react';

interface CampusCareAssistantProps {
  onNavigateToSubmit: () => void;
  onNavigateToServices: () => void;
}

export const CampusCareAssistant: React.FC<CampusCareAssistantProps> = ({
  onNavigateToSubmit,
  onNavigateToServices,
}) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string; action?: string }>>([
    {
      sender: 'assistant',
      text: 'Hello! I am the CampusCare University Grievance Guide. Ask me anything about university complaint filing, guaranteed SLA timelines, resolution verification, emergency reporting, or office contact points.',
    },
  ]);

  const knowledgeBase = [
    {
      keywords: ['submit', 'file', 'report', 'create', 'how to'],
      answer:
        'To submit a grievance, navigate to "New Grievance". Enter a clear title and description. As you type, the Live Smart Engine will automatically suggest the responsible department, priority tier, and SLA. You can also attach photos or documents as evidence.',
      action: 'submit',
    },
    {
      keywords: ['sla', 'time', 'hours', 'deadline', 'duration', 'escalate'],
      answer:
        'CampusCare enforces strict university Service Level Agreements: Critical hazards must be resolved within 4 hours; High urgency issues within 12 hours; Medium issues within 48 hours; Low administrative issues within 120 hours. If an SLA is breached, the grievance is auto-escalated to the Dean of Student Affairs.',
    },
    {
      keywords: ['reopen', 'not fixed', 'verify', 'verification', 'reject'],
      answer:
        'Under CampusCare V3’s Resolution Verification loop, when a duty officer marks your issue as "Resolved", you receive a verification prompt. If the physical repair is not satisfactory, you can click "No, problem persists — reopen" with a note. The ticket will instantly reopen with elevated priority.',
    },
    {
      keywords: ['duplicate', 'similar', 'already reported'],
      answer:
        'CampusCare uses automatic text similarity matching to detect duplicate tickets. If another student has already reported the same issue (such as a Wi-Fi outage or water leak in your block), you will see an immediate warning with a direct link to follow the existing ticket.',
    },
    {
      keywords: ['anonymous', 'privacy', 'secret', 'identity', 'ragging', 'harassment'],
      answer:
        'You can toggle "Submit as Anonymous Student" when reporting an issue. Your name and roll number will be concealed from regular staff displays. Critical safety or harassment reports immediately alert university security while preserving student anonymity.',
    },
    {
      keywords: ['office', 'phone', 'contact', 'location', 'desk', 'warden', 'it desk'],
      answer:
        'You can view all university helpdesk contacts, physical room numbers, and telephone extensions in the Campus Service Directory.',
      action: 'services',
    },
    {
      keywords: ['qr', 'code', 'inspection', 'scan'],
      answer:
        'Every complaint has a dedicated Inspection QR Code. Wardens and maintenance inspectors can scan the code directly on-site to review the live timeline and verify completed repairs.',
    },
  ];

  const handleAsk = (userQuery?: string) => {
    const q = (userQuery || query).trim().toLowerCase();
    if (!q) return;

    const userEntry = userQuery || query;
    setMessages((prev) => [...prev, { sender: 'user', text: userEntry }]);
    setQuery('');

    // Match keywords
    let match = knowledgeBase.find((item) =>
      item.keywords.some((k) => q.includes(k))
    );

    const reply = match
      ? match.answer
      : 'CampusCare is your university grievance system. You can file complaints, track live progress, verify resolutions before closure, and rate service quality. For department specific contacts, check the Service Directory.';

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: reply,
          action: match?.action,
        },
      ]);
    }, 300);
  };

  const sampleQueries = [
    'How do I track my grievance and SLA status?',
    'What happens if an issue is not actually fixed?',
    'How does duplicate detection work?',
    'Can I file an anonymous complaint?',
    'Where is the IT Helpdesk located?',
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <div className="text-xs uppercase tracking-wider font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
          Smart Guidance & FAQ
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
          CampusCare Assistant
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Instant answers on university grievance policies, SLA resolution guarantees, and administrative workflows.
        </p>
      </div>

      {/* Suggested chips */}
      <div className="flex flex-wrap gap-2">
        {sampleQueries.map((sq, i) => (
          <button
            key={i}
            onClick={() => handleAsk(sq)}
            className="text-xs py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-indigo-500 transition-colors text-left"
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Chat Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden flex flex-col h-[480px]">
        {/* Messages */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${
                m.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.sender === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-md p-3.5 rounded-xl text-xs leading-relaxed space-y-2 ${
                  m.sender === 'user'
                    ? 'bg-slate-900 text-white dark:bg-indigo-600 ml-12'
                    : 'bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-800 mr-12'
                }`}
              >
                <p>{m.text}</p>
                {m.action === 'submit' && (
                  <button
                    onClick={onNavigateToSubmit}
                    className="inline-flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400 hover:underline pt-1 text-[11px]"
                  >
                    Open Grievance Intake Form <ChevronRight className="w-3 h-3" />
                  </button>
                )}
                {m.action === 'services' && (
                  <button
                    onClick={onNavigateToServices}
                    className="inline-flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400 hover:underline pt-1 text-[11px]"
                  >
                    Open Campus Service Directory <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Query Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex gap-2"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about complaint rules, reopening, SLA timeframes, or evidence requirements..."
            className="flex-1 px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={!query.trim()}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            Ask
          </button>
        </form>
      </div>
    </div>
  );
};
