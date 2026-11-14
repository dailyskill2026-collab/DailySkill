// src/screens/Onboarding/SummaryScreen.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useProfileStore } from "../../store/profileStore";
import OnboardingLayout from "../../components/layout/OnboardingLayout";
import OnboardingProgress from "../../components/common/OnboardingProgress";
import SelectableChip from "../../components/common/SelectableChip";

const SummaryScreen: React.FC = () => {
  const navigate = useNavigate();
  const { profile, setProfile } = useProfileStore();

  const handleFinish = () => {
    // Mark onboarding as completed and navigate to home (Today screen)
    setProfile({ onboardingCompleted: true, isGuest: false });
    navigate("/", { replace: true });
  };

  const handleBack = () => {
    navigate("/onboarding/preference");
  };

  // Helper to render a list of items
  const renderList = (title: string, items: string[] | number[]) => (
    <div className="mb-3">
      <p className="font-medium mb-1">{title}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((it, idx) => (
          <SelectableChip key={idx} label={String(it)} selected={true} onClick={() => {}} />
        ))}
      </div>
    </div>
  );

  return (
    <OnboardingLayout>
      <OnboardingProgress step={6} totalSteps={6} />
      <h2 className="text-xl font-semibold mb-4">Review Your Profile</h2>
      <div className="space-y-4 mb-6">
        <p><strong>Name:</strong> {profile.name || "(not set)"}</p>
        <p><strong>Technology:</strong> {profile.technology?.toUpperCase() || "(not set)"}</p>
        {renderList("Role", [profile.role])}
        {renderList("Experience", [profile.experience])}
        {renderList("Learning Goals", profile.goals)}
        {renderList("Interests", profile.interests)}
        {renderList("Daily Duration (min)", [profile.dailyDuration])}
        <p><strong>Reminder:</strong> {profile.reminder?.toString() || "None"}</p>
      </div>
      <div className="flex justify-between mt-4">
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded"
        >
          Back
        </button>
        <button
          onClick={handleFinish}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Finish
        </button>
      </div>
    </OnboardingLayout>
  );
};

export default SummaryScreen;
