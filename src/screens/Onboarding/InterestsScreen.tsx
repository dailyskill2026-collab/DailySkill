// src/screens/Onboarding/InterestsScreen.tsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProfileStore } from "@/store/profileStore";
import OnboardingProgress from "@/components/common/OnboardingProgress";
import SelectableChip from "@/components/common/SelectableChip";

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
  const interests = useProfileStore((state) => state.interests) || [];
  const role = useProfileStore((state) => state.role);
  const setProfile = useProfileStore((state) => state.setProfile);

  // Ensure we start with at least the default interests for the selected role
  useEffect(() => {
    if (interests.length === 0 && role) {
      const defaults = role.includes("admin")
        ? ["Administration", "Flows and Automation"]
        : role.includes("dev")
        ? ["Apex", "Lightning Web Components", "REST / SOAP Integrations"]
        : ["Apex", "Flows and Automation"];
      setProfile({ interests: defaults as any });
    }
  }, [interests.length, role, setProfile]);

  const toggleInterest = (topic: string) => {
    const newInterests = interests.includes(topic as any)
      ? interests.filter((i) => i !== topic)
      : [...interests, topic as any];
    setProfile({ interests: newInterests });
  };

  const handleNext = () => {
    navigate("/onboarding/preference");
  };

  const handleBack = () => {
    navigate("/onboarding/goals");
  };

  return (
    <div className="max-w-md mx-auto p-4 flex flex-col">
      <OnboardingProgress step={5} total={6} />
      <h2 className="text-lg font-semibold mb-2">Select Your Learning Interests</h2>
      <p className="mb-4 text-xs text-secondary">
        Choose any topics you want to focus on. You can always change them later.
      </p>
      <div className="flex flex-wrap gap-2 mb-6">
        {SALESFORCE_TOPICS.map((topic) => (
          <SelectableChip
            key={topic}
            label={topic}
            selected={interests.includes(topic as any)}
            onClick={() => toggleInterest(topic)}
          />
        ))}
      </div>
      <div className="flex justify-between mt-4">
        <button
          onClick={handleBack}
          className="text-sm text-brand-600 underline"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={interests.length === 0}
          className="px-4 py-2 bg-brand-600 text-white rounded-xl hover:opacity-90 transition disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default InterestsScreen;
