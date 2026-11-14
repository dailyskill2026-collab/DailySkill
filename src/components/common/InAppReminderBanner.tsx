// src/components/common/InAppReminderBanner.tsx
import React, { useState, useEffect } from 'react';
import { getActiveInAppReminders, dismissReminder, InAppReminder } from '@/services/reminderService';
import { Bell, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function InAppReminderBanner() {
  const [reminders, setReminders] = useState<InAppReminder[]>([]);

  useEffect(() => {
    setReminders(getActiveInAppReminders());
  }, []);

  if (reminders.length === 0) return null;
  const current = reminders[0];

  const handleDismiss = () => {
    dismissReminder(current.id);
    setReminders((prev) => prev.filter((r) => r.id !== current.id));
  };

  return (
    <div className="card p-3 bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 flex items-center justify-between gap-3 animate-fade-in mb-4">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center flex-shrink-0">
          <Bell size={16} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-primary truncate">{current.title}</p>
          <p className="text-2xs text-secondary truncate">{current.message}</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        <Link
          to={current.actionPath}
          className="px-2.5 py-1 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-2xs font-semibold flex items-center gap-1 transition"
        >
          <span>{current.actionLabel}</span>
          <ArrowRight size={10} />
        </Link>
        {current.dismissible && (
          <button
            onClick={handleDismiss}
            aria-label="Dismiss reminder"
            className="p-1 text-muted hover:text-primary rounded-lg transition"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
