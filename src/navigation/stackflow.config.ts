import { defineConfig } from "@stackflow/config";

export const config = defineConfig({
  activities: [
    { name: "TutorialActivity" },
    { name: "MainActivity" },
    { name: "TodayMissionActivity" },
    { name: "FarmerMissionActivity" },
    { name: "InformationActivity" },
    { name: "ProfileActivity" },
    { name: "DexActivity" },
    { name: "CustomizeActivity" },
    { name: "JackpotActivity" },
    { name: "RoulletActivity" },
    { name: "EventAroundActivity" },
    { name: "ShowBenefitActivity" },
    { name: "LiveWatchingActivity" },
  ],
  transitionDuration: 420,
  initialActivity: () => "MainActivity",
});
