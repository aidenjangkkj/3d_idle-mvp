import { stackflow } from "@stackflow/react/future";
import {
  CustomizeActivity,
  DexActivity,
  EventAroundActivity,
  FarmerMissionActivity,
  InformationActivity,
  JackpotActivity,
  LiveWatchingActivity,
  MainActivity,
  ProfileActivity,
  RoulletActivity,
  ShowBenefitActivity,
  TodayMissionActivity,
  TutorialActivity,
} from "../app/activities";
import { navigationLoggerPlugin } from "./navigationLoggerPlugin";
import { slideRendererPlugin } from "./slideRendererPlugin";
import { config } from "./stackflow.config";

export const { Stack } = stackflow({
  config,
  components: {
    TutorialActivity,
    MainActivity,
    TodayMissionActivity,
    FarmerMissionActivity,
    InformationActivity,
    ProfileActivity,
    DexActivity,
    CustomizeActivity,
    JackpotActivity,
    RoulletActivity,
    EventAroundActivity,
    ShowBenefitActivity,
    LiveWatchingActivity,
  },
  plugins: [slideRendererPlugin(), navigationLoggerPlugin()],
});
