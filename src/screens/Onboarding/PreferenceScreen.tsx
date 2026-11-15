// src/screens/Onboarding/PreferenceScreen.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useProfileStore } from "@/store/profileStore";
import OnboardingProgress from "@/components/common/OnboardingProgress";
import SelectableChip from "@/components/common/SelectableChip";

const DURATION_OPTIONS = [2, 5, 10]; // minutes
const REMINDER_OPTIONS = ["Morning", "Afternoon", "Evening", "None"]; // "None" means no reminders

const PreferenceScreen: React.FC = () => {
  const navigate = useNavigate();
  const dailyDuration = useProfileStore((state) => state.dailyDuration);
  const reminder = useProfileStore((state) => state.reminder);
  const setProfile = useProfileStore((state) => state.setProfile);

  const toggleDuration = (value: number) => {
    setProfile({ dailyDuration: value as any });
  };

  const toggleReminder = (value: string) => {
    // store as lowercase for consistency
    const normalized = value.toLowerCase() === "none" ? "none" : value.toLowerCase();
    setProfile({ reminder: normalized as any });
  };

  const handleNext = () => {
    navigate("/onboarding/summary");
  };

  const handleBack = () => {
    navigate("/onboarding/interests");
  };

  return (
    <div className="max-w-md mx-auto p-4 flex flex-col">
      <OnboardingProgress step={6} total={6} />
      <h2 className="text-lg font-semibold mb-2">Daily Learning Preference</h2>
      <p className="mb-4 text-xs text-secondary">
        Customize your daily learning pace and notifications.
      </p>

      <section className="mb-6">
        <p className="mb-2 text-sm font-medium">How much time can you spend learning daily?</p>
        <div className="flex flex-wrap gap-2">
          {DURATION_OPTIONS.map((min) => (
            <SelectableChip
              key={min}
              label={`${min} minutes`}
              selected={dailyDuration === min}
              onClick={() => toggleDuration(min)}
            />
          ))}
        </div>
      </section>

      <section className="mb-6">
        <p className="mb-2 text-sm font-medium">Preferred reminder time (optional)</p>
        <div className="flex flex-wrap gap-2">
          {REMINDER_OPTIONS.map((opt) => (
            <SelectableChip
              key={opt}
              label={opt}
              selected={reminder === opt.toLowerCase()}
              onClick={() => toggleReminder(opt)}
            />
          ))}
        </div>
      </section>

      <div className="flex justify-between mt-4">
        <button
          onClick={handleBack}
          className="text-sm text-brand-600 underline"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="px-4 py-2 bg-brand-600 text-white rounded-xl hover:opacity-90 transition"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PreferenceScreen;
