// src/screens/Onboarding/InterestsScreen.tsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProfileStore } from "../../store/profileStore";
import OnboardingLayout from "../../components/layout/OnboardingLayout";
import OnboardingProgress from "../../components/common/OnboardingProgress";
import SelectableChip from "../../components/common/SelectableChip";

// Salesforce interest topics (can be expanded later)
const SALESFORCE_TOPICS = [
  "Administration",
  "Apex",
  "Triggers",
  "Asynchronous Apex",
  "Lightning Web Components",
  "Flows and Automation",
  "REST / SOAP Integrations",
  "Security and Sharing",
  "Experience Cloud",
  "Sales Cloud",
  "Service Cloud",
  "Financial Services Cloud",
  "Health Cloud",
  "Agentforce",
  "Deployment and DevOps",
  "Interview Preparation",
];

const InterestsScreen: React.FC = () => {
  const navigate = useNavigate();
  const profile = useProfileStore();
  const setProfile = profile.setProfile;

  // Ensure we start with at least the default interests for the selected role
  useEffect(() => {
    if (profile.interests.length === 0 && profile.role) {
      // simple default mapping – can be refined later
      const defaults = profile.role.includes("admin")
        ? ["Administration", "Flows and Automation"]
        : profile.role.includes("dev")
        ? ["Apex", "Lightning Web Components", "REST / SOAP Integrations"]
        : [];
      setProfile({ interests: defaults });
    }
  }, []);

  const toggleInterest = (topic: string) => {
    const newInterests = profile.interests.includes(topic)
      ? profile.interests.filter((i) => i !== topic)
      : [...profile.interests, topic];
    setProfile({ interests: newInterests });
  };

  const handleNext = () => {
    navigate("/onboarding/preference");
  };

  const handleBack = () => {
    navigate("/onboarding/role-experience");
  };

  return (
    <OnboardingLayout>
      <OnboardingProgress step={4} totalSteps={6} />
      <h2 className="text-xl font-semibold mb-4">Select Your Learning Interests</h2>
      <p className="mb-4 text-gray-600 dark:text-gray-300">
        Choose any topics you want to focus on. You can always change them later.
      </p>
      <div className="flex flex-wrap gap-2 mb-6">
        {SALESFORCE_TOPICS.map((topic) => (
          <SelectableChip
            key={topic}
            label={topic}
            selected={profile.interests.includes(topic)}
            onClick={() => toggleInterest(topic)}
          />
        ))}
      </div>
      <div className="flex justify-between mt-4">
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={profile.interests.length === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </OnboardingLayout>
  );
};

export default InterestsScreen;
