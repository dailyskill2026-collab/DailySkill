// src/screens/Onboarding/PreferenceScreen.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useProfileStore } from "../../store/profileStore";
import OnboardingLayout from "../../components/layout/OnboardingLayout";
import OnboardingProgress from "../../components/common/OnboardingProgress";
import SelectableChip from "../../components/common/SelectableChip";

const DURATION_OPTIONS = [2, 5, 10]; // minutes
const REMINDER_OPTIONS = ["Morning", "Afternoon", "Evening", "None"]; // "None" means no reminders

const PreferenceScreen: React.FC = () => {
  const navigate = useNavigate();
  const profile = useProfileStore();
  const setProfile = profile.setProfile;

  const toggleDuration = (value: number) => {
    setProfile({ dailyDuration: value });
  };

  const toggleReminder = (value: string) => {
    // store as lowercase for consistency
    const normalized = value.toLowerCase() === "none" ? "none" : value.toLowerCase();
    setProfile({ reminder: normalized });
  };

  const handleNext = () => {
    navigate("/onboarding/summary");
  };

  const handleBack = () => {
    navigate("/onboarding/interests");
  };

  return (
    <OnboardingLayout>
      <OnboardingProgress step={5} totalSteps={6} />
      <h2 className="text-xl font-semibold mb-4">Daily Learning Preference</h2>

      <section className="mb-6">
        <p className="mb-2 font-medium">How much time can you spend learning daily?</p>
        <div className="flex flex-wrap gap-2">
          {DURATION_OPTIONS.map((min) => (
            <SelectableChip
              key={min}
              label={`${min} minutes`}
              selected={profile.dailyDuration === min}
              onClick={() => toggleDuration(min)}
            />
          ))}
        </div>
      </section>

      <section className="mb-6">
        <p className="mb-2 font-medium">Preferred reminder time (optional)</p>
        <div className="flex flex-wrap gap-2">
          {REMINDER_OPTIONS.map((opt) => (
            <SelectableChip
              key={opt}
              label={opt}
              selected={profile.reminder === opt.toLowerCase()}
              onClick={() => toggleReminder(opt)}
            />
          ))}
        </div>
      </section>

      <div className="flex justify-between mt-4">
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Next
        </button>
      </div>
    </OnboardingLayout>
  );
};

export default PreferenceScreen;
