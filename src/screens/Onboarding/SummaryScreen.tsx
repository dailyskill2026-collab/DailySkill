// src/screens/Onboarding/SummaryScreen.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { useProfileStore } from "@/store/profileStore";
import OnboardingProgress from "@/components/common/OnboardingProgress";
import SelectableChip from "@/components/common/SelectableChip";

const SummaryScreen: React.FC = () => {
  const navigate = useNavigate();
  const name = useProfileStore((state) => state.name);
  const technology = useProfileStore((state) => state.technology);
  const role = useProfileStore((state) => state.role);
  const experience = useProfileStore((state) => state.experience);
  const goals = useProfileStore((state) => state.goals) || [];
  const interests = useProfileStore((state) => state.interests) || [];
  const dailyDuration = useProfileStore((state) => state.dailyDuration);
  const reminder = useProfileStore((state) => state.reminder);
  const setProfile = useProfileStore((state) => state.setProfile);

  const handleFinish = () => {
    // Mark onboarding as completed and navigate to home (Today screen)
    setProfile({ onboardingCompleted: true, isGuest: false });
    navigate("/", { replace: true });
  };

  const handleBack = () => {
    navigate("/onboarding/preference");
  };

  // Helper to render a list of items
  const renderList = (title: string, items: (string | number)[]) => {
    const list = items.filter(Boolean);
    if (list.length === 0) return null;
    return (
      <div className="mb-3">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">{title}</p>
        <div className="flex flex-wrap gap-1.5">
          {list.map((it, idx) => (
            <SelectableChip key={idx} label={String(it)} selected={true} onClick={() => {}} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto p-4 flex flex-col">
      <OnboardingProgress step={6} total={6} />
      
      <div className="flex items-center gap-2 mb-2">
        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Review Your Profile</h2>
      </div>
      <p className="text-xs text-secondary mb-4">
        Everything is ready for your personalized daily upskilling plan.
      </p>

      <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-2xl p-4 space-y-3 mb-6 shadow-sm">
        {name && (
          <div>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</span>
            <p className="font-medium text-sm text-primary">{name}</p>
          </div>
        )}
        <div>
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Primary Track</span>
          <p className="font-semibold text-sm text-brand-600">{technology?.toUpperCase() || "SALESFORCE"}</p>
        </div>
        {role && renderList("Target Role", [role.replace(/_/g, ' ')])}
        {experience && renderList("Experience Level", [`${experience} years`])}
        {renderList("Learning Goals", goals.map(g => g.replace(/_/g, ' ')))}
        {renderList("Focus Topics", interests)}
        <div>
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Daily Commitment</span>
          <p className="font-medium text-sm text-primary">{dailyDuration || 5} minutes per day</p>
        </div>
        <div>
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reminder Time</span>
          <p className="font-medium text-sm text-primary capitalize">{reminder || "None"}</p>
        </div>
      </div>

      <div className="flex justify-between items-center mt-2">
        <button
          onClick={handleBack}
          className="text-sm text-brand-600 underline"
        >
          Back
        </button>
        <button
          onClick={handleFinish}
          className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl shadow-md transition"
        >
          Finish & Start Learning
        </button>
      </div>
    </div>
  );
};

export default SummaryScreen;
