// src/screens/Admin/AdminAnalyticsScreen.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  Users,
  Target,
  Sparkles,
  ArrowDownRight,
  TrendingUp,
  Download,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Filter,
  Plus,
  Clock,
  Layers,
} from 'lucide-react';
import { metricsService } from '@/services/metricsService';
import { journeyFunnelService } from '@/services/journeyFunnelService';
import { feedbackService } from '@/services/feedbackService';
import { backlogService } from '@/services/backlogService';
import { betaSimulationService } from '@/services/betaSimulationService';
import { exportService } from '@/services/exportService';
import type { EngagementSummary, RetentionCohort, FunnelStage } from '@/types/analytics';
import type {
  UserFeedback,
  ContentQualitySummary,
  FeedbackStatus,
  FeedbackPriority,
} from '@/types/feedback';
import type { BacklogTask, BacklogStatus, BacklogPriority } from '@/types/backlog';

export default function AdminAnalyticsScreen() {
  const [timeWindow, setTimeWindow] = useState<'today' | '7days' | '30days'>('7days');
  const [includeSimulated, setIncludeSimulated] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'funnel' | 'content' | 'feedback' | 'backlog' | 'beta'>('overview');

  const [metrics, setMetrics] = useState<EngagementSummary | null>(null);
  const [cohorts, setCohorts] = useState<RetentionCohort[]>([]);
  const [funnel, setFunnel] = useState<FunnelStage[]>([]);
  const [contentSummaries, setContentSummaries] = useState<ContentQualitySummary[]>([]);
  const [feedbackList, setFeedbackList] = useState<UserFeedback[]>([]);
  const [backlogTasks, setBacklogTasks] = useState<BacklogTask[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // New Backlog Task Form Modal State
  const [isBacklogModalOpen, setIsBacklogModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<any>('feature_suggestion');
  const [newPriority, setNewPriority] = useState<BacklogPriority>('medium');

  const flashNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const now = new Date();
      let startDate: string | undefined = undefined;
      if (timeWindow === 'today') {
        startDate = now.toISOString().split('T')[0] + 'T00:00:00Z';
      } else if (timeWindow === '7days') {
        startDate = new Date(now.getTime() - 7 * 86400000).toISOString();
      } else if (timeWindow === '30days') {
        startDate = new Date(now.getTime() - 30 * 86400000).toISOString();
      }

      const [summary, ch, fn, cs, fb, bl] = await Promise.all([
        metricsService.getEngagementSummary({ includeSimulated, startDate }),
        metricsService.getRetentionCohorts(includeSimulated),
        journeyFunnelService.getFunnelStages({ includeSimulated, startDate }),
        feedbackService.getContentQualitySummaries(includeSimulated),
        feedbackService.getAllFeedback(includeSimulated),
        backlogService.getAllTasks(),
      ]);

      setMetrics(summary);
      setCohorts(ch);
      setFunnel(fn);
      setContentSummaries(cs);
      setFeedbackList(fb);
      setBacklogTasks(bl);
    } catch (e: any) {
      console.error('Failed to load admin analytics:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [timeWindow, includeSimulated]);

  const handleRunSimulation = async () => {
    const res = await betaSimulationService.runBetaSimulation(8);
    flashNotice(
      `Beta simulation complete: ${res.profilesSimulated} personas, ${res.eventsGenerated} events, ${res.feedbackGenerated} feedback items generated.`
    );
    loadAllData();
  };

  const handleResetSimulation = async () => {
    await betaSimulationService.resetSimulationData();
    flashNotice('All simulated beta data was cleared. Real user data remains intact.');
    loadAllData();
  };

  const handleStatusChange = async (feedbackId: string, status: FeedbackStatus) => {
    await feedbackService.updateStatus(feedbackId, status, `Admin updated status to ${status}`);
    flashNotice(`Feedback status updated to ${status}`);
    loadAllData();
  };

  const handlePriorityChange = async (feedbackId: string, priority: FeedbackPriority) => {
    await feedbackService.updatePriority(feedbackId, priority);
    flashNotice(`Feedback priority updated to ${priority}`);
    loadAllData();
  };

  const handleCreateBacklogTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      await backlogService.createTask({
        title: newTitle.trim(),
        description: newDesc.trim(),
        category: newCategory,
        priority: newPriority,
        estimatedEffort: 'M',
      });
      setIsBacklogModalOpen(false);
      setNewTitle('');
      setNewDesc('');
      flashNotice('Backlog task created successfully.');
      loadAllData();
    } catch (err: any) {
      alert(err?.message || 'Failed to create task.');
    }
  };

  const handleConvertFeedbackToBacklog = async (fb: UserFeedback) => {
    try {
      await backlogService.createTask({
        title: `[Feedback] ${fb.category.replace('_', ' ')}: ${fb.description.substring(0, 50)}...`,
        description: `Source feedback: ${fb.description}\nReported by: ${fb.mockUserId}`,
        category: fb.category,
        priority: fb.priority,
        sourceFeedbackIds: [fb.id],
      });
      flashNotice('Feedback converted into a backlog task.');
      loadAllData();
    } catch (err: any) {
      alert(err?.message || 'Failed to convert.');
    }
  };

  return (
    <div className="pb-safe max-w-5xl mx-auto px-4 pt-4 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-2">
            <Link to="/" className="text-xs text-brand-600 dark:text-brand-400 hover:underline">
              ← Back to App
            </Link>
            <span className="text-xs text-muted">/</span>
            <span className="text-xs text-muted">Mock Admin Console</span>
          </div>
          <h1 className="text-2xl font-bold text-primary mt-1 flex items-center gap-2">
            <BarChart3 className="text-brand-500" size={24} />
            Product Analytics & Feedback
          </h1>
          <p className="text-xs text-secondary mt-0.5">
            100% local in-browser telemetry, engagement funnel, cohort retention & beta testing
          </p>
        </div>

        {/* Global Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Time Window */}
          <div className="flex rounded-xl border border-gray-300 dark:border-gray-700 bg-surface-card p-0.5 text-xs">
            {(['today', '7days', '30days'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeWindow(t)}
                className={`px-2.5 py-1 rounded-lg capitalize font-medium transition-colors ${
                  timeWindow === t
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'text-secondary hover:text-primary'
                }`}
              >
                {t === '7days' ? 'Last 7 Days' : t === '30days' ? 'Last 30 Days' : 'Today'}
              </button>
            ))}
          </div>

          {/* Simulation Toggle */}
          <button
            onClick={() => setIncludeSimulated(!includeSimulated)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors ${
              includeSimulated
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-800 dark:text-amber-300'
                : 'bg-surface-card border-gray-300 dark:border-gray-700 text-secondary'
            }`}
          >
            <Sparkles size={13} />
            <span>{includeSimulated ? 'Simulated Data Included' : 'Real Only'}</span>
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 rounded-xl text-xs flex items-center gap-2 border border-brand-200 dark:border-brand-800 animate-fade-in">
          <CheckCircle2 size={16} />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b dark:border-gray-800 overflow-x-auto text-sm gap-2">
        {[
          { id: 'overview', label: 'Engagement & KPIs' },
          { id: 'funnel', label: 'User Journey Funnel' },
          { id: 'content', label: 'Content Performance' },
          { id: 'feedback', label: `Feedback (${feedbackList.length})` },
          { id: 'backlog', label: `Product Backlog (${backlogTasks.length})` },
          { id: 'beta', label: 'Beta Simulator' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-2.5 px-3 font-medium whitespace-nowrap transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-secondary hover:text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW & RETENTION */}
      {activeTab === 'overview' && metrics && (
        <div className="space-y-6">
          {/* KPI Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Daily Active (DAU)', value: metrics.dau, sub: 'Active learners today' },
              { label: 'Weekly Active (WAU)', value: metrics.wau, sub: 'Active last 7 days' },
              {
                label: 'Completion Rate',
                value: `${metrics.lessonCompletionRate}%`,
                sub: `${metrics.lessonsCompleted}/${metrics.lessonsStarted} lessons`,
              },
              {
                label: 'Quiz Accuracy',
                value: `${metrics.quizAccuracy}%`,
                sub: `${metrics.quizAttempts} attempts`,
              },
              {
                label: 'Avg Sessions',
                value: metrics.averageSessionsPerUser,
                sub: 'Sessions per user',
              },
              {
                label: 'Goal Met %',
                value: `${metrics.weeklyGoalCompletionRate}%`,
                sub: 'Achieved weekly goal',
              },
            ].map((kpi) => (
              <div key={kpi.label} className="card p-3.5 space-y-1">
                <p className="text-2xs font-semibold text-secondary uppercase tracking-wider">
                  {kpi.label}
                </p>
                <p className="text-2xl font-bold text-primary">{kpi.value}</p>
                <p className="text-2xs text-muted truncate">{kpi.sub}</p>
              </div>
            ))}
          </div>

          {/* Retention Cohorts Section */}
          <div className="card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-primary flex items-center gap-1.5">
                  <TrendingUp size={16} className="text-brand-500" />
                  Cohort Retention Analysis
                </h2>
                <p className="text-xs text-secondary">
                  Percentage of learners returning on Day 1 and Day 7 after first active date
                </p>
              </div>
              <span className="text-2xs text-muted">Cohorts: {cohorts.length}</span>
            </div>

            {cohorts.length === 0 ? (
              <p className="text-xs text-muted py-4 text-center">No cohort data recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b dark:border-gray-800 text-secondary">
                      <th className="py-2 font-medium">Cohort Date</th>
                      <th className="py-2 font-medium">Users</th>
                      <th className="py-2 font-medium">Day 1 Retention</th>
                      <th className="py-2 font-medium">Day 7 Retention</th>
                      <th className="py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-light dark:divide-border-dark">
                    {cohorts.map((c) => (
                      <tr key={c.cohortDate} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                        <td className="py-2 font-mono">{c.cohortDate}</td>
                        <td className="py-2 font-semibold">{c.userCount}</td>
                        <td className="py-2">
                          {c.day1RetentionRate !== null ? (
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                              {c.day1RetentionRate}% ({c.day1RetainedCount}/{c.userCount})
                            </span>
                          ) : (
                            <span className="text-muted text-2xs italic bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                              Insufficient Data
                            </span>
                          )}
                        </td>
                        <td className="py-2">
                          {c.day7RetentionRate !== null ? (
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                              {c.day7RetentionRate}% ({c.day7RetainedCount}/{c.userCount})
                            </span>
                          ) : (
                            <span className="text-muted text-2xs italic bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                              Insufficient Data
                            </span>
                          )}
                        </td>
                        <td className="py-2">
                          {c.isComplete ? (
                            <span className="text-2xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                              Matured
                            </span>
                          ) : (
                            <span className="text-2xs text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded">
                              Observing
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Export Actions Panel */}
          <div className="card p-4 space-y-3">
            <h2 className="text-sm font-bold text-primary flex items-center gap-1.5">
              <Download size={16} className="text-brand-500" />
              Local Data Export (No External Network Call)
            </h2>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                onClick={() => exportService.exportFeedbackAsCsv(includeSimulated)}
                className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Feedback (CSV)
              </button>
              <button
                onClick={() => exportService.exportFeedbackAsJson(includeSimulated)}
                className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Feedback (JSON)
              </button>
              <button
                onClick={() => exportService.exportAnalyticsEventsAsCsv(includeSimulated)}
                className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Analytics Events (CSV)
              </button>
              <button
                onClick={() => exportService.exportAnalyticsEventsAsJson(includeSimulated)}
                className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Analytics Events (JSON)
              </button>
              <button
                onClick={() => exportService.exportBacklogAsCsv()}
                className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Product Backlog (CSV)
              </button>
              <button
                onClick={() => exportService.exportAggregatedMetricsAsJson(includeSimulated)}
                className="px-3 py-1.5 rounded-lg border border-brand-500 text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/40"
              >
                Aggregated Metrics (JSON)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER JOURNEY FUNNEL */}
      {activeTab === 'funnel' && (
        <div className="card p-5 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-primary flex items-center gap-1.5">
              <Target size={16} className="text-brand-500" />
              Daily Learning Journey Funnel
            </h2>
            <p className="text-xs text-secondary">
              Conversion rates and drop-offs across the 8 journey milestones
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {funnel.map((stage, idx) => (
              <div key={stage.stageId} className="space-y-1 text-xs">
                <div className="flex items-center justify-between font-medium">
                  <span className="text-primary flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-brand-100 dark:bg-brand-900/60 text-brand-600 dark:text-brand-300 flex items-center justify-center text-2xs font-bold">
                      {idx + 1}
                    </span>
                    {stage.stageName}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-secondary">{stage.userCount} users</span>
                    <span className="font-semibold text-brand-600 dark:text-brand-400 w-12 text-right">
                      {stage.conversionRate}%
                    </span>
                  </div>
                </div>

                {/* Funnel Bar */}
                <div className="h-2.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-500 rounded-full transition-all duration-500"
                    style={{ width: `${stage.conversionRate}%` }}
                  />
                </div>

                {/* Drop-off info */}
                {idx < funnel.length - 1 && stage.dropOffCount > 0 && (
                  <p className="text-2xs text-rose-500 flex items-center gap-1 pl-7">
                    <ArrowDownRight size={11} />
                    {stage.dropOffCount} learners dropped off ({stage.dropOffRate}% drop-off)
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CONTENT PERFORMANCE */}
      {activeTab === 'content' && (
        <div className="card p-4 space-y-3">
          <div>
            <h2 className="text-sm font-bold text-primary">Content Quality & Performance</h2>
            <p className="text-xs text-secondary">
              Evaluates helpfulness ratings, reported issues, and flags content requiring admin review
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b dark:border-gray-800 text-secondary">
                  <th className="py-2 font-medium">Lesson / Content Title</th>
                  <th className="py-2 font-medium">Helpful</th>
                  <th className="py-2 font-medium">Not Helpful</th>
                  <th className="py-2 font-medium">Helpfulness %</th>
                  <th className="py-2 font-medium">Issues Reported</th>
                  <th className="py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light dark:divide-border-dark">
                {contentSummaries.map((cs) => (
                  <tr key={cs.contentId} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                    <td className="py-2 font-medium text-primary">
                      {cs.title}
                      <span className="block text-2xs text-muted font-mono">{cs.contentId}</span>
                    </td>
                    <td className="py-2 text-emerald-600 font-semibold">{cs.helpfulCount}</td>
                    <td className="py-2 text-rose-600 font-semibold">{cs.notHelpfulCount}</td>
                    <td className="py-2 font-semibold">{cs.helpfulnessRatio}%</td>
                    <td className="py-2">
                      {cs.issueCount > 0 ? (
                        <span className="text-rose-600 font-semibold flex items-center gap-1">
                          <AlertTriangle size={12} />
                          {cs.issueCount} issues
                        </span>
                      ) : (
                        <span className="text-muted">0</span>
                      )}
                    </td>
                    <td className="py-2">
                      {cs.needsReview ? (
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 rounded-full text-2xs font-semibold">
                          Needs Review
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 rounded-full text-2xs">
                          Healthy
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: FEEDBACK MANAGEMENT */}
      {activeTab === 'feedback' && (
        <div className="card p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-primary">Learner Feedback Queue</h2>
              <p className="text-xs text-secondary">
                Review submitted bugs, feature requests, and content issue reports
              </p>
            </div>
            <span className="text-xs text-muted">{feedbackList.length} items</span>
          </div>

          {feedbackList.length === 0 ? (
            <p className="text-center py-8 text-xs text-muted">No feedback recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {feedbackList.map((fb) => (
                <div
                  key={fb.id}
                  className="p-3 border rounded-xl border-border-light dark:border-border-dark space-y-2 text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                        {fb.category.replace('_', ' ')}
                      </span>
                      {fb.rating && (
                        <span className="text-amber-500 font-semibold">★ {fb.rating}/5</span>
                      )}
                      {fb.isSimulated && (
                        <span className="text-2xs bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded">
                          Simulated
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Priority selector */}
                      <select
                        value={fb.priority}
                        onChange={(e) =>
                          handlePriorityChange(fb.id, e.target.value as FeedbackPriority)
                        }
                        className="p-1 rounded border border-gray-300 dark:border-gray-700 bg-surface-card text-2xs font-medium"
                      >
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>

                      {/* Status selector */}
                      <select
                        value={fb.status}
                        onChange={(e) =>
                          handleStatusChange(fb.id, e.target.value as FeedbackStatus)
                        }
                        className="p-1 rounded border border-gray-300 dark:border-gray-700 bg-surface-card text-2xs font-semibold capitalize"
                      >
                        <option value="new">New</option>
                        <option value="under_review">Under Review</option>
                        <option value="planned">Planned</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </div>

                  <p className="text-primary font-medium">{fb.description}</p>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-2xs text-muted pt-1 border-t dark:border-gray-800">
                    <div>
                      <span>User: {fb.mockUserId}</span>
                      {fb.relatedContentId && <span className="ml-2">Content: {fb.relatedContentId}</span>}
                      <span className="ml-2">{new Date(fb.createdAt).toLocaleString()}</span>
                    </div>

                    {!fb.linkedBacklogTaskId ? (
                      <button
                        onClick={() => handleConvertFeedbackToBacklog(fb)}
                        className="text-brand-600 dark:text-brand-400 hover:underline font-semibold"
                      >
                        + Convert to Backlog Task
                      </button>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        ✓ In Backlog ({fb.linkedBacklogTaskId})
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: PRODUCT IMPROVEMENT BACKLOG */}
      {activeTab === 'backlog' && (
        <div className="card p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-primary">Product Improvement Backlog</h2>
              <p className="text-xs text-secondary">
                Actionable tasks derived from learner feedback and analytics findings
              </p>
            </div>
            <button
              onClick={() => setIsBacklogModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold"
            >
              <Plus size={14} />
              <span>New Task</span>
            </button>
          </div>

          {backlogTasks.length === 0 ? (
            <p className="text-center py-8 text-xs text-muted">
              Backlog is empty. Convert feedback items into tasks or create one.
            </p>
          ) : (
            <div className="space-y-3">
              {backlogTasks.map((t) => (
                <div
                  key={t.taskId}
                  className="p-3 border rounded-xl border-border-light dark:border-border-dark space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary text-sm">{t.title}</span>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-2xs uppercase font-bold bg-gray-100 dark:bg-gray-800">
                        {t.priority}
                      </span>
                      <span className="px-2 py-0.5 rounded text-2xs capitalize font-semibold bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                        {t.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <p className="text-secondary">{t.description}</p>
                  <div className="flex items-center justify-between text-2xs text-muted pt-1">
                    <span>Effort: {t.estimatedEffort} · Created: {new Date(t.createdAt).toLocaleDateString()}</span>
                    <span>Linked Feedback: {t.sourceFeedbackIds.length}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: BETA USER SIMULATOR */}
      {activeTab === 'beta' && (
        <div className="card p-5 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-primary flex items-center gap-1.5">
              <Sparkles size={16} className="text-brand-500" />
              Realistic Beta Learner Simulation
            </h2>
            <p className="text-xs text-secondary">
              Generates multi-day learning activity across 5 distinct persona profiles (Fresher, Developer, Senior, Admin, Busy Pro) to evaluate retention and analytics models.
            </p>
          </div>

          <div className="p-3.5 bg-gray-50 dark:bg-gray-800/60 rounded-xl space-y-2 text-xs">
            <p className="font-semibold text-primary">Simulated Persona Profiles:</p>
            <ul className="list-disc pl-5 space-y-1 text-secondary">
              <li><strong>Profile A (Fresher):</strong> High lesson starts, moderate quiz accuracy (60%), daily active streak.</li>
              <li><strong>Profile B (Developer):</strong> 3 yrs exp, LWC focus, high quiz accuracy (85%), reports feedback.</li>
              <li><strong>Profile C (Senior):</strong> 7 yrs exp, high speed, reports UI contrast bug.</li>
              <li><strong>Profile D (Admin):</strong> Flows focus, high revision rates, reports outdated release note.</li>
              <li><strong>Profile E (Busy Pro):</strong> 3-min budget, checks in on Day 1 & Day 7.</li>
            </ul>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleRunSimulation}
              className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              <Play size={14} />
              <span>Run 5-Profile Simulation</span>
            </button>
            <button
              onClick={handleResetSimulation}
              className="flex items-center gap-1.5 px-4 py-2 border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl text-xs font-semibold"
            >
              <RotateCcw size={14} />
              <span>Reset Simulated Beta Data</span>
            </button>
          </div>
        </div>
      )}

      {/* New Backlog Task Modal */}
      {isBacklogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface-card rounded-2xl max-w-md w-full p-5 border border-border-light dark:border-border-dark space-y-3 text-xs">
            <h3 className="text-sm font-bold text-primary">Create Backlog Task</h3>
            <form onSubmit={handleCreateBacklogTask} className="space-y-3">
              <div>
                <label className="block text-secondary mb-1">Task Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Add dark mode SOQL syntax highlighter"
                  required
                  className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-surface-card text-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-secondary mb-1">Description</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Detailed requirements..."
                  rows={3}
                  className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-surface-card text-primary outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-secondary mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-surface-card text-primary outline-none"
                  >
                    <option value="feature_suggestion">Feature Suggestion</option>
                    <option value="bug_report">Bug Report</option>
                    <option value="content_issue">Content Issue</option>
                    <option value="learning_experience">Learning Experience</option>
                  </select>
                </div>
                <div>
                  <label className="block text-secondary mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as BacklogPriority)}
                    className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-surface-card text-primary outline-none"
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBacklogModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-secondary hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-brand-600 text-white rounded-lg font-semibold"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
