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
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { learningAssistantService } from '@/services/learningAssistantService';
import { doubtHistoryService } from '@/services/doubtHistoryService';
import { feedbackService } from '@/services/feedbackService';
import { repositories } from '@/repositories';
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

      // If opening fresh without previous messages, show friendly greeting
      if (messages.length === 0) {
        setMessages([
          {
            id: 'msg-welcome',
            sender: 'assistant',
            text: `Hello! I am your AI Learning Assistant (Mock Mode). Ask me any doubt about ${
              context?.topicTitle || context?.lessonTitle || 'Salesforce development'
            }, or click one of the suggested questions below.`,
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
    // If the latest message has an assistant response, reformat it immediately
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
        setActionNotice('Reported for mock admin review. Thank you!');
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="AI Learning Assistant"
    >
      <div className="bg-surface-card rounded-2xl max-w-2xl w-full h-[85vh] flex flex-col shadow-2xl border border-border-light dark:border-border-dark overflow-hidden">
        {/* Header */}
        <div className="gradient-brand p-4 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shadow-xs">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold leading-tight">AI Learning Assistant</h2>
                <span className="text-2xs bg-white/20 border border-white/30 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                  Demo / Mock
                </span>
              </div>
              <p className="text-xs text-brand-200">Predefined local verified answers & real-world examples</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close Assistant"
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Context bar & Tab bar */}
        <div className="bg-gray-50 dark:bg-gray-800/60 border-b border-border-light dark:border-border-dark px-4 py-2 flex items-center justify-between text-xs flex-shrink-0">
          <div className="flex items-center gap-2 truncate mr-2">
            <BookOpen size={14} className="text-brand-500 flex-shrink-0" />
            <span className="text-secondary truncate">
              Context:{' '}
              <strong className="text-primary font-medium">
                {context?.lessonTitle || context?.topicTitle || 'Salesforce Developer'}
              </strong>
            </span>
          </div>

          {/* Tab switcher */}
          <div className="flex rounded-lg bg-surface-card border border-border-light dark:border-border-dark p-0.5 flex-shrink-0">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                activeTab === 'chat'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              Ask Doubt
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-2.5 py-1 rounded-md font-medium flex items-center gap-1 transition-colors ${
                activeTab === 'history'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-secondary hover:text-primary'
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
          <div className="flex-1 flex flex-col min-h-0">
            {/* Style Selector Toolbar */}
            <div className="px-4 py-2 border-b border-border-light dark:border-border-dark flex items-center gap-2 text-xs flex-shrink-0 bg-surface-card">
              <span className="text-2xs uppercase tracking-wider text-muted font-bold mr-1">Style:</span>
              <button
                onClick={() => handleStyleChange('simple')}
                className={`px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                  selectedStyle === 'simple'
                    ? 'bg-brand-50 dark:bg-brand-950 border-brand-500 text-brand-600 dark:text-brand-300'
                    : 'border-border-light dark:border-border-dark text-secondary hover:text-primary'
                }`}
              >
                💡 Simple
              </button>
              <button
                onClick={() => handleStyleChange('real_world')}
                className={`px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                  selectedStyle === 'real_world'
                    ? 'bg-brand-50 dark:bg-brand-950 border-brand-500 text-brand-600 dark:text-brand-300'
                    : 'border-border-light dark:border-border-dark text-secondary hover:text-primary'
                }`}
              >
                🏢 Real-World Example
              </button>
              <button
                onClick={() => handleStyleChange('interview')}
                className={`px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                  selectedStyle === 'interview'
                    ? 'bg-brand-50 dark:bg-brand-950 border-brand-500 text-brand-600 dark:text-brand-300'
                    : 'border-border-light dark:border-border-dark text-secondary hover:text-primary'
                }`}
              >
                🎯 Interview Answer
              </button>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  } animate-fade-in`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs ${
                      msg.sender === 'user'
                        ? 'bg-brand-600 text-white rounded-br-xs shadow-xs'
                        : 'bg-gray-100 dark:bg-gray-800/80 text-primary border border-border-light dark:border-border-dark rounded-bl-xs shadow-xs'
                    }`}
                  >
                    <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>

                    {/* Source reference info if available */}
                    {msg.response?.matchedAnswer && (
                      <div className="mt-3 pt-2.5 border-t border-gray-200 dark:border-gray-700/80 text-2xs space-y-1">
                        <div className="flex items-center gap-1 font-semibold text-brand-600 dark:text-brand-400">
                          <ShieldCheck size={12} />
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
                            className="text-brand-500 hover:underline flex items-center gap-1 inline-flex"
                          >
                            <span>Official Documentation</span>
                            <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    )}

                    {/* Assistant Feedback Actions */}
                    {msg.sender === 'assistant' && msg.id !== 'msg-welcome' && (
                      <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700/80 flex items-center justify-between text-2xs text-muted">
                        <span>Was this helpful?</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleFeedback(msg.id, 'helpful', msg.response)}
                            disabled={!!feedbackGiven[msg.id]}
                            className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
                              feedbackGiven[msg.id] === 'helpful' ? 'text-emerald-500 font-bold' : ''
                            }`}
                            title="Helpful"
                          >
                            <ThumbsUp size={12} />
                          </button>
                          <button
                            onClick={() => handleFeedback(msg.id, 'not_helpful', msg.response)}
                            disabled={!!feedbackGiven[msg.id]}
                            className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
                              feedbackGiven[msg.id] === 'not_helpful' ? 'text-rose-500 font-bold' : ''
                            }`}
                            title="Not helpful"
                          >
                            <ThumbsDown size={12} />
                          </button>
                          <button
                            onClick={() => handleFeedback(msg.id, 'reported', msg.response)}
                            disabled={!!feedbackGiven[msg.id]}
                            className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ml-1 ${
                              feedbackGiven[msg.id] === 'reported' ? 'text-rose-500 font-bold' : ''
                            }`}
                            title="Report incorrect explanation"
                          >
                            <Flag size={12} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="text-3xs text-muted mt-1 px-1">{msg.timestamp}</span>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-xs text-secondary italic py-2">
                  <Sparkles size={14} className="animate-spin text-brand-500" />
                  <span>Checking approved knowledge base...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Suggested Question Chips */}
            {suggestedQuestions.length > 0 && (
              <div className="px-4 py-2 border-t border-border-light dark:border-border-dark bg-surface-card flex-shrink-0">
                <p className="text-2xs uppercase tracking-wider text-muted font-bold mb-1.5 flex items-center gap-1">
                  <Sparkles size={11} className="text-brand-500" />
                  Suggested Questions:
                </p>
                <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                  {suggestedQuestions.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleAsk(q)}
                      className="px-2.5 py-1 rounded-lg text-2xs bg-gray-100 hover:bg-brand-50 dark:bg-gray-800 dark:hover:bg-brand-950/60 border border-gray-200 dark:border-gray-700 text-primary hover:text-brand-600 dark:hover:text-brand-300 transition-colors text-left"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAsk(inputQuestion);
              }}
              className="p-3 border-t border-border-light dark:border-border-dark flex items-center gap-2 bg-surface-card flex-shrink-0"
            >
              <input
                type="text"
                value={inputQuestion}
                onChange={(e) => setInputQuestion(e.target.value)}
                placeholder="Ask any doubt (e.g. What is Queueable Apex?)..."
                disabled={loading}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-surface-card text-xs text-primary focus:ring-2 focus:ring-brand-500 outline-none"
              />
              <button
                type="submit"
                disabled={loading || !inputQuestion.trim()}
                className="p-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl disabled:opacity-40 transition-colors shadow-xs"
                aria-label="Send question"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        ) : (
          /* TAB 2: DOUBT HISTORY */
          <div className="flex-1 flex flex-col min-h-0 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-2.5 text-muted" />
                <input
                  type="text"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="Search previous doubts..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-surface-card text-xs text-primary outline-none"
                />
              </div>
              <button
                onClick={handleClearHistory}
                disabled={historyList.length === 0}
                className="flex items-center gap-1 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors disabled:opacity-40"
              >
                <Trash2 size={13} />
                <span>Clear</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredHistory.length === 0 ? (
                <p className="text-center text-xs text-muted py-10">No doubts recorded yet.</p>
              ) : (
                filteredHistory.map((d) => (
                  <div
                    key={d.doubtId}
                    onClick={() => {
                      setActiveTab('chat');
                      handleAsk(d.question);
                    }}
                    className="p-3 border rounded-xl border-border-light dark:border-border-dark hover:border-brand-500 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-all space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-primary">{d.question}</span>
                      <span
                        className={`text-2xs px-2 py-0.5 rounded-full capitalize font-medium ${
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
