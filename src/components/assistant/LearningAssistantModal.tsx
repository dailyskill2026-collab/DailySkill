// src/components/assistant/LearningAssistantModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Bot,
  Send,
  Sparkles,
  BookOpen,
  ThumbsUp,
  ThumbsDown,
  Flag,
  History,
  Trash2,
  Search,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Settings,
} from 'lucide-react';
import { learningAssistantService } from '@/services/learningAssistantService';
import { doubtHistoryService } from '@/services/doubtHistoryService';
import { feedbackService } from '@/services/feedbackService';
import { repositories } from '@/repositories';
import { getAIConfig, saveAIConfig, AIProviderType } from '@/store/aiConfigStore';
import type {
  ExplanationStyle,
  AssistantResponse,
  DoubtRecord,
} from '@/types/assistant';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  context?: {
    topicId?: string;
    topicTitle?: string;
    lessonId?: string;
    lessonTitle?: string;
  };
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  response?: AssistantResponse;
  timestamp: string;
}

export default function LearningAssistantModal({ isOpen, onClose, context }: Props) {
  const [activeTab, setActiveTab] = useState<'chat' | 'history'>('chat');
  const [inputQuestion, setInputQuestion] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<ExplanationStyle>('simple');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);

  // Doubt History state
  const [historyList, setHistoryList] = useState<DoubtRecord[]>([]);
  const [historySearch, setHistorySearch] = useState('');

  // Feedback on active response
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, 'helpful' | 'not_helpful' | 'reported'>>({});
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // AI Configuration state (Mock vs Gemini vs OpenAI)
  const [showConfig, setShowConfig] = useState(false);
  const [aiConfig, setAiConfig] = useState(getAIConfig());
  const [tempKey, setTempKey] = useState(aiConfig.geminiApiKey || aiConfig.openaiApiKey || '');
  const [selectedProvider, setSelectedProvider] = useState<AIProviderType>(aiConfig.provider);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const user = repositories.auth.getCurrentUser();
  const userId = user?.uid || 'guest-user';

  useEffect(() => {
    if (isOpen) {
      const suggestions = learningAssistantService.getSuggestedQuestions({
        topicId: context?.topicId,
        lessonId: context?.lessonId,
      });
      setSuggestedQuestions(suggestions);

      if (messages.length === 0) {
        setMessages([
          {
            id: 'msg-welcome',
            sender: 'assistant',
            text: `Hi! I am your AI Learning Assistant. Ask me any doubt about ${
              context?.topicTitle || context?.lessonTitle || 'Salesforce development'
            }, or tap one of the suggested topics below.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
      loadHistory();
    }
  }, [isOpen, context]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const loadHistory = async () => {
    const list = await doubtHistoryService.getDoubtsByUser(userId);
    setHistoryList(list);
  };

  const handleAsk = async (questionText: string) => {
    if (!questionText.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: questionText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setLoading(true);

    try {
      const res = await learningAssistantService.askQuestion(questionText.trim(), {
        topicId: context?.topicId,
        topicTitle: context?.topicTitle,
        lessonId: context?.lessonId,
        selectedStyle,
      });

      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: res.content,
        response: res,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      if (res.suggestedQuestions?.length) {
        setSuggestedQuestions(res.suggestedQuestions);
      }
      loadHistory();
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `asst-err-${Date.now()}`,
          sender: 'assistant',
          text: 'An error occurred while retrieving the answer. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleStyleChange = async (newStyle: ExplanationStyle) => {
    setSelectedStyle(newStyle);
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.sender === 'assistant' && lastMsg.response?.matchedAnswer) {
      const lastUserQuestion = [...messages]
        .reverse()
        .find((m) => m.sender === 'user')?.text;

      if (lastUserQuestion) {
        setLoading(true);
        const updated = await learningAssistantService.askQuestion(lastUserQuestion, {
          topicId: context?.topicId,
          lessonId: context?.lessonId,
          selectedStyle: newStyle,
        });

        setMessages((prev) => {
          const clone = [...prev];
          clone[clone.length - 1] = {
            ...clone[clone.length - 1],
            text: updated.content,
            response: updated,
          };
          return clone;
        });
        setLoading(false);
      }
    }
  };

  const handleFeedback = async (
    msgId: string,
    action: 'helpful' | 'not_helpful' | 'reported',
    resp?: AssistantResponse
  ) => {
    setFeedbackGiven((prev) => ({ ...prev, [msgId]: action }));

    try {
      if (action === 'reported' && resp?.matchedAnswer) {
        await feedbackService.submitContentQualityFeedback({
          contentId: resp.matchedAnswer.knowledgeId,
          issueType: 'incorrect_information',
          comment: `Reported incorrect assistant explanation for: "${resp.matchedAnswer.canonicalQuestion}"`,
          mockUserId: userId,
        });
        setActionNotice('Reported for review. Thank you!');
      } else if (resp?.matchedAnswer) {
        await feedbackService.submitContentQualityFeedback({
          contentId: resp.matchedAnswer.knowledgeId,
          vote: action === 'helpful' ? 'helpful' : 'not_helpful',
          mockUserId: userId,
        });
        setActionNotice(action === 'helpful' ? 'Marked helpful 👍' : 'Feedback recorded');
      }
      setTimeout(() => setActionNotice(null), 3000);
    } catch {
      // ignore
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm('Clear all your stored doubt history?')) {
      await doubtHistoryService.clearUserDoubts(userId);
      setHistoryList([]);
      setActionNotice('Doubt history cleared.');
      setTimeout(() => setActionNotice(null), 3000);
    }
  };

  const filteredHistory = historyList.filter(
    (d) =>
      d.question.toLowerCase().includes(historySearch.toLowerCase()) ||
      d.topicTitle.toLowerCase().includes(historySearch.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="AI Learning Assistant"
    >
      {/* Modal Container: Mobile Bottom-Sheet & Desktop Centered Dialog */}
      <div className="bg-white dark:bg-[#131c17] rounded-t-3xl sm:rounded-3xl max-w-2xl w-full h-[90vh] sm:h-[82vh] flex flex-col shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
        
        {/* Mobile Drag Indicator */}
        <div className="sm:hidden pt-2 pb-1 flex justify-center bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600">
          <div className="w-12 h-1 rounded-full bg-white/40" />
        </div>

        {/* Calming Pista Green & Ocean Blue Gradient Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 px-4 py-3.5 sm:px-5 sm:py-4 text-white flex items-center justify-between flex-shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/20 backdrop-blur-md border border-white/25 flex items-center justify-center shadow-xs">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-bold leading-tight tracking-tight">AI Assistant</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-white/20 backdrop-blur-sm border border-white/30 text-white flex items-center gap-1">
                  <Sparkles size={9} />
                  {aiConfig.provider === 'gemini'
                    ? 'Gemini 1.5 Flash'
                    : aiConfig.provider === 'openai'
                    ? 'OpenAI'
                    : 'Salesforce AI'}
                </span>
              </div>
              <p className="text-[11px] text-emerald-100 leading-tight">
                {aiConfig.provider !== 'mock' && (aiConfig.geminiApiKey || aiConfig.openaiApiKey)
                  ? 'Real-time AI answers & architecture guidance'
                  : 'Instant verified answers & real-world patterns'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowConfig(!showConfig)}
              aria-label="AI Settings"
              title="Configure AI Provider (Gemini / OpenAI)"
              className={`p-2 rounded-xl transition-all ${
                showConfig || aiConfig.provider !== 'mock'
                  ? 'bg-white/30 text-white'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Settings size={17} />
            </button>
            <button
              onClick={onClose}
              aria-label="Close Assistant"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-white active:scale-95"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* AI Configuration Panel */}
        {showConfig && (
          <div className="p-4 bg-emerald-50/90 dark:bg-slate-900 border-b border-emerald-200 dark:border-emerald-800/60 text-xs flex-shrink-0 animate-fade-in space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-emerald-950 dark:text-emerald-200">
                <Sparkles size={15} className="text-emerald-600" />
                <span>AI Engine Settings</span>
              </div>
              <button
                onClick={() => setShowConfig(false)}
                className="text-emerald-700 dark:text-emerald-400 hover:underline text-xs"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedProvider('mock')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  selectedProvider === 'mock'
                    ? 'border-emerald-600 bg-white dark:bg-slate-800 shadow-xs ring-1 ring-emerald-500'
                    : 'border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/40 opacity-75'
                }`}
              >
                <div className="font-semibold text-emerald-950 dark:text-white">Verified Curriculum</div>
                <div className="text-[10px] text-slate-500">Zero-cost local verified corpus</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedProvider('gemini')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  selectedProvider === 'gemini'
                    ? 'border-teal-600 bg-white dark:bg-slate-800 shadow-xs ring-1 ring-teal-500'
                    : 'border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/40 opacity-75'
                }`}
              >
                <div className="font-semibold text-teal-700 dark:text-teal-300">Gemini 1.5 Flash</div>
                <div className="text-[10px] text-slate-500">Google AI Studio (Fast & Free)</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedProvider('openai')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  selectedProvider === 'openai'
                    ? 'border-sky-600 bg-white dark:bg-slate-800 shadow-xs ring-1 ring-sky-500'
                    : 'border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/40 opacity-75'
                }`}
              >
                <div className="font-semibold text-sky-700 dark:text-sky-300">OpenAI</div>
                <div className="text-[10px] text-slate-500">GPT-4o mini completions</div>
              </button>
            </div>

            {selectedProvider !== 'mock' ? (
              <div className="space-y-2">
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  {selectedProvider === 'gemini' ? 'Google Gemini API Key' : 'OpenAI API Key'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={tempKey}
                    onChange={(e) => setTempKey(e.target.value)}
                    placeholder={selectedProvider === 'gemini' ? 'Paste AIzaSy... key here' : 'Paste sk-... key here'}
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const patch = {
                        provider: selectedProvider,
                        ...(selectedProvider === 'gemini' ? { geminiApiKey: tempKey } : { openaiApiKey: tempKey }),
                      };
                      const updated = saveAIConfig(patch);
                      setAiConfig(updated);
                      learningAssistantService.refreshProviderFromConfig();
                      setActionNotice(`Switched to Live ${selectedProvider.toUpperCase()} AI!`);
                      setShowConfig(false);
                      setTimeout(() => setActionNotice(null), 3000);
                    }}
                    className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-xs"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <p className="text-[11px] text-slate-500">Using the verified local Salesforce answers.</p>
                <button
                  type="button"
                  onClick={() => {
                    const updated = saveAIConfig({ provider: 'mock' });
                    setAiConfig(updated);
                    learningAssistantService.refreshProviderFromConfig();
                    setActionNotice('Switched to Verified Mock Mode.');
                    setShowConfig(false);
                    setTimeout(() => setActionNotice(null), 3000);
                  }}
                  className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white rounded-xl font-medium text-xs"
                >
                  Apply
                </button>
              </div>
            )}
          </div>
        )}

        {/* Context bar & Tab bar */}
        <div className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800 px-4 py-2 flex items-center justify-between text-xs flex-shrink-0">
          <div className="flex items-center gap-2 truncate mr-2">
            <BookOpen size={14} className="text-emerald-600 shrink-0" />
            <span className="text-slate-500 truncate text-[11px] sm:text-xs">
              Context:{' '}
              <strong className="text-slate-800 dark:text-slate-200 font-semibold">
                {context?.lessonTitle || context?.topicTitle || 'Salesforce Developer'}
              </strong>
            </span>
          </div>

          {/* Minimal Tab switcher */}
          <div className="flex rounded-xl bg-slate-200/70 dark:bg-slate-800 p-0.5 flex-shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'chat'
                  ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-200 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Ask Doubt
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                activeTab === 'history'
                  ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-200 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <History size={12} />
              <span>History ({historyList.length})</span>
            </button>
          </div>
        </div>

        {/* Global Notice banner if any */}
        {actionNotice && (
          <div className="px-4 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-2xs flex items-center gap-1.5 border-b border-emerald-200 dark:border-emerald-800 flex-shrink-0">
            <CheckCircle2 size={13} />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* TAB 1: CHAT VIEW */}
        {activeTab === 'chat' ? (
          <div className="flex-1 flex flex-col min-h-0 bg-slate-50/40 dark:bg-[#101713]">
            {/* Minimal Style Selector Toolbar */}
            <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-xs flex-shrink-0 bg-white dark:bg-[#131c17] overflow-x-auto no-scrollbar">
              <span className="text-[10px] uppercase tracking-wider text-muted font-bold mr-1 shrink-0">Style:</span>
              <button
                type="button"
                onClick={() => handleStyleChange('simple')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                  selectedStyle === 'simple'
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                💡 Simple
              </button>
              <button
                type="button"
                onClick={() => handleStyleChange('real_world')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                  selectedStyle === 'real_world'
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                🏢 Real-World
              </button>
              <button
                type="button"
                onClick={() => handleStyleChange('interview')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                  selectedStyle === 'interview'
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                🎯 Interview
              </button>
            </div>

            {/* Chat Messages Conversation Stream */}
            <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  } animate-fade-in`}
                >
                  <div
                    className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-xs shadow-xs'
                        : 'bg-white dark:bg-slate-800/90 text-primary border border-slate-200/80 dark:border-slate-700/80 rounded-tl-xs shadow-xs'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>

                    {/* Source reference info if available */}
                    {msg.response?.matchedAnswer && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/80 text-2xs space-y-1">
                        <div className="flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
                          <ShieldCheck size={13} />
                          <span>Approved Source Reference:</span>
                        </div>
                        <p className="text-secondary">
                          {msg.response.matchedAnswer.sourceReference.sourceName} —{' '}
                          {msg.response.matchedAnswer.sourceReference.section}
                        </p>
                        {msg.response.matchedAnswer.sourceReference.sourceUrl && (
                          <a
                            href={msg.response.matchedAnswer.sourceReference.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 inline-flex font-semibold"
                          >
                            <span>Official Documentation</span>
                            <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    )}

                    {/* Assistant Feedback Actions */}
                    {msg.sender === 'assistant' && msg.id !== 'msg-welcome' && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between text-2xs text-muted">
                        <span>Helpful?</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleFeedback(msg.id, 'helpful', msg.response)}
                            disabled={!!feedbackGiven[msg.id]}
                            className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
                              feedbackGiven[msg.id] === 'helpful' ? 'text-emerald-600 font-bold' : ''
                            }`}
                            title="Helpful"
                          >
                            <ThumbsUp size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFeedback(msg.id, 'not_helpful', msg.response)}
                            disabled={!!feedbackGiven[msg.id]}
                            className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
                              feedbackGiven[msg.id] === 'not_helpful' ? 'text-rose-500 font-bold' : ''
                            }`}
                            title="Not helpful"
                          >
                            <ThumbsDown size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFeedback(msg.id, 'reported', msg.response)}
                            disabled={!!feedbackGiven[msg.id]}
                            className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ml-1 ${
                              feedbackGiven[msg.id] === 'reported' ? 'text-rose-500 font-bold' : ''
                            }`}
                            title="Report incorrect"
                          >
                            <Flag size={12} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-muted mt-1 px-1">{msg.timestamp}</span>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-xs text-secondary italic py-2">
                  <Sparkles size={14} className="animate-spin text-emerald-500" />
                  <span>Checking approved knowledge base...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Suggested Question Chips (Horizontal Swipeable Carousel) */}
            {suggestedQuestions.length > 0 && (
              <div className="px-3 py-2 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-[#131c17] flex-shrink-0">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted shrink-0 flex items-center gap-1">
                    <Sparkles size={11} className="text-emerald-500" />
                    Try:
                  </span>
                  {suggestedQuestions.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => handleAsk(q)}
                      className="px-3 py-1 rounded-full text-2xs bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-300 transition-all shrink-0 whitespace-nowrap active:scale-95"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Gen-Z Sleek Pill Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAsk(inputQuestion);
              }}
              className="p-3 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#131c17] flex items-center gap-2 flex-shrink-0"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputQuestion}
                  onChange={(e) => setInputQuestion(e.target.value)}
                  placeholder="Ask any doubt (e.g. What is Queueable Apex?)..."
                  disabled={loading}
                  className="w-full pl-4 pr-11 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-primary focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all shadow-inner"
                />
                <button
                  type="submit"
                  disabled={loading || !inputQuestion.trim()}
                  className="absolute right-1.5 top-1.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center disabled:opacity-40 transition-all shadow-xs active:scale-95"
                  aria-label="Send question"
                >
                  <Send size={13} />
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* TAB 2: DOUBT HISTORY */
          <div className="flex-1 flex flex-col min-h-0 p-4 space-y-3 bg-white dark:bg-[#131c17]">
            <div className="flex items-center justify-between gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-2.5 text-muted" />
                <input
                  type="text"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="Search previous doubts..."
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-primary outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <button
                type="button"
                onClick={handleClearHistory}
                disabled={historyList.length === 0}
                className="flex items-center gap-1 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors disabled:opacity-40 font-medium"
              >
                <Trash2 size={13} />
                <span>Clear</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredHistory.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center mx-auto text-emerald-600">
                    <History size={18} />
                  </div>
                  <p className="text-xs text-muted">No doubts recorded yet. Ask a question to build history!</p>
                </div>
              ) : (
                filteredHistory.map((d) => (
                  <div
                    key={d.doubtId}
                    onClick={() => {
                      setActiveTab('chat');
                      handleAsk(d.question);
                    }}
                    className="p-3.5 border rounded-2xl border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:bg-emerald-50/20 dark:hover:bg-slate-800/50 cursor-pointer transition-all space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-primary">{d.question}</span>
                      <span
                        className={`text-2xs px-2 py-0.5 rounded-full capitalize font-semibold ${
                          d.status === 'answered'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {d.status}
                      </span>
                    </div>
                    <p className="text-secondary line-clamp-2">{d.answerSummary}</p>
                    <div className="flex items-center justify-between text-2xs text-muted pt-1">
                      <span>Topic: {d.topicTitle}</span>
                      <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
