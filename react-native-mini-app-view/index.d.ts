import React from "react";

declare module "react-native-mini-app-view";

export class MiniAppView extends React.Component<any, any> {}

interface MiniAppViewManager {}
export const MiniAppViewManager: MiniAppViewManager;

interface Config {
  storage: any;
}
export function setup(config: Config): void;

export interface IMiniApp {
  deployments: any;
  mainComponentName: string;
  miniAppName: string;
  packageName: string;
}

export interface ICallbacks {
  onGetLocalPackageError: (res: any) => void;
  onGetRemotePackageError: (res: any) => void;
  onSaveRemotePackageInfoError: (res: any) => void;
  onProcess: (res: number, length: number) => void;
}

export interface IResponseCheckVersionMiniApp {
  miniAppName: any;
  packageName: any;
  deploymentKey: any;
  shouldUpdate: boolean;
  useLocal: boolean;
}

export function checkVersionMiniApp(
  env: any,
  miniApp: IMiniApp,
  callbacks: ICallbacks
): Promise<IResponseCheckVersionMiniApp>;

export function checkVersionMultiMiniApp(
  env: any,
  miniApps: any,
  callbacks: any
): Promise<{
  appsUpdateOnline: any[];
  appsUpdateOffline: any[];
  updateApps: (miniAppsUpdate: any, callbacks: any) => Promise<void>;
}>;

export function updateApps(
  miniApps: IResponseCheckVersionMiniApp[],
  callbacks?: any
): Promise<any>;
