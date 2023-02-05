import { NativeModules } from "react-native";
import MiniAppView from "./src/RCTMiniAppView";
import {
  checkVersionMiniApp,
  checkVersionMultiMiniApp,
  setup,
  updateApps,
} from "./src/CoreFix";
const { MiniAppViewManager } = NativeModules;

export {
  MiniAppView,
  MiniAppViewManager,
  checkVersionMiniApp,
  checkVersionMultiMiniApp,
  setup,
  updateApps,
};
