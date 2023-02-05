import { Platform } from "react-native";
import { log } from "./Utils";
import codePush from "react-native-code-push";
import RNFS from "react-native-fs";
import { unzip, subscribe } from "react-native-zip-archive";

let AsyncStorage = undefined;

export function setup(config) {
  const { storage } = config;
  AsyncStorage = storage;
}

export async function checkVersionMultiMiniApp(env, miniApps, callbacks) {
  if (AsyncStorage === undefined) {
    throw Error("Must setup storage api first!");
  }

  const _callback = validateCallback(callbacks);
  const tokens = Object.entries(miniApps);
  const resultPromises = tokens.map(([miniAppName, miniAppInfo]) =>
    checkVersionMiniApp(env, { ...miniAppInfo, miniAppName }, _callback)
  );
  return Promise.all(resultPromises).then((results) => {
    const appsUpdateOnline = [];
    const appsUpdateOffline = [];
    tokens.forEach((token, index) => {
      if (results[index].shouldUpdate) {
        const data = results[index];
        data.app = token[0];
        data.env = env;
        data.useLocal
          ? appsUpdateOffline.push(data)
          : appsUpdateOnline.push(data);
      }
    });
    return {
      appsUpdateOnline,
      appsUpdateOffline,
      updateApps,
    };
  });
}

export async function checkVersionMiniApp(env, miniApp, callbacks) {
  const _callbacks = validateCallback(callbacks);
  const { packageName, mainComponentName, deployments, miniAppName } = miniApp;
  log(`Checking for update ${mainComponentName}`);
  const localPackage = await getLocalPackageInfo(packageName, _callbacks);
  const isOpenFirstTime = localPackage === null;
  const deploymentKey = getDeploymentKey(env, deployments, _callbacks);
  const remotePackage = await getLatestRemotePackageInfo(
    deploymentKey,
    _callbacks
  );
  const { onProcess } = _callbacks;
  onProcess && onProcess(4, 4);
  const result = {
    miniAppName,
    packageName,
    deploymentKey,
    shouldUpdate: true,
    useLocal: true,
  };

  if (!remotePackage) {
    if (isOpenFirstTime) {
      result.shouldUpdate = true;
      result.useLocal = true;
    } else {
      result.shouldUpdate = false;
      result.useLocal = false;
    }
  } else {
    if (isOpenFirstTime) {
      result.shouldUpdate = true;
      result.useLocal = false;
    } else {
      result.shouldUpdate = comparePackageVersion(localPackage, remotePackage);
      result.useLocal = false;
    }
  }
  return result;
}

async function getLocalPackageInfo(packageName, callbacks) {
  try {
    const data = await AsyncStorage.getItem(packageName);
    if (data) {
      const localPackage = JSON.parse(data);
      log("Get local package DONE.");
      return localPackage;
    } else {
      log("Local package NOT EXISTS(handle like open app the first time).");
    }
  } catch (error) {
    log("Get local package FAIL (handle like open app the first time).");
    const { onGetLocalPackageError } = callbacks;
    onGetLocalPackageError && onGetLocalPackageError({ packageName, error });
  }
  const { onProcess } = callbacks;
  onProcess && onProcess(1, 4);
  return null;
}

function getDeploymentKey(env, deployments, callbacks) {
  const deployment = deployments[env];
  if (!deployment) {
    throw Error(`${env} environment not exitst`);
  }
  const currentPlatform = Platform.OS === "android";
  const platformDeployment = currentPlatform
    ? deployment.android
    : deployment.ios;
  if (!platformDeployment) {
    throw Error(
      `${env} environment configuration does not support ${currentPlatform} platform.`
    );
  }
  const { onProcess } = callbacks;
  onProcess && onProcess(2, 4);
  return platformDeployment;
}

function queue(all) {
  if (all.length === 0) return Promise.resolve([]);
  return new Promise((resolve, reject) => {
    const output = [];
    next(all.splice(0, 1)[0]);
    function next(hanlder) {
      // console.log("================  Begin Update  ================");
      hanlder()
        .then((res) => {
          output.push(res);
          const _hanlder = all.splice(0, 1)[0];
          if (!_hanlder) {
            return resolve(output);
          }
          // console.log("================  Finish Update  ================");
          next(_hanlder);
        })
        .catch((error) => {
          output.push(error);
          const _hanlder = all.splice(0, 1)[0];
          if (!_hanlder) {
            return resolve(output);
          }
          next(_hanlder);
        });
    }
  });
}

export async function updateApps(miniAppsUpdate, callbacks) {
  const _callbacks = validateCallback(callbacks);
  const { onUnzipProgress, onUpdateBegin, onUpdateFinish } = _callbacks;
  if (miniAppsUpdate && miniAppsUpdate.length > 0) {
    const appsUpdateOnline = [];
    const appsUpdateOffline = [];

    miniAppsUpdate.forEach((app) => {
      app.useLocal ? appsUpdateOffline.push(app) : appsUpdateOnline.push(app);
    });

    const zipProgress = subscribe((res) => {
      onUnzipProgress && onUnzipProgress(res);
    });

    onUpdateBegin &&
      onUpdateBegin({
        totalPackage: miniAppsUpdate.length,
      });

    const onlineHandlers = appsUpdateOnline.map((appInfo, index) => {
      return () =>
        updateAppOnline(appInfo.packageName, appInfo.deploymentKey, _callbacks);
    });

    const offlineHandlers = appsUpdateOffline.map((appInfo, index) => {
      return () => updateAppOffline(appInfo.packageName, _callbacks);
    });

    const results = await queue([...onlineHandlers, ...offlineHandlers]);
    onUpdateFinish && onUpdateFinish(results);
    zipProgress.remove();
  }
}

async function updateAppOnline(packageName, deploymentKey, callbacks) {
  const remotePackage = await getLatestRemotePackageInfo(
    deploymentKey,
    callbacks
  );
  const { onUpdateError } = callbacks;
  console.log("updateAppOnline", remotePackage, remotePackage.downloadUrl);
  if (!remotePackage) {
    // handle can't get latest remote package.
    onUpdateError &&
      onUpdateError({
        packageName,
        error: "Handle can't get latest remote package.",
      });
    return;
  }

  const dowloadFilePath = `${RNFS.DocumentDirectoryPath}/${packageName}.zip`;
  const isDonwloadDone = await downloadBundle(
    remotePackage.downloadUrl,
    dowloadFilePath,
    callbacks
  );
  if (!isDonwloadDone) {
    // handle download remote package fail.
    onUpdateError &&
      onUpdateError({
        packageName,
        error: "Handle download remote package fail.",
      });
    return;
  }

  const unzipFilePath = `${RNFS.DocumentDirectoryPath}/${packageName}`;
  const isUnzipDone = await unzipPackage(
    dowloadFilePath,
    unzipFilePath,
    callbacks
  );

  if (!isUnzipDone) {
    // handle unzip remote package fail.
    onUpdateError &&
      onUpdateError({
        packageName,
        error: "Handle unzip remote package fail.",
      });
    return;
  }
  if (Platform.OS === "android") {
    const unzipFilePathDir = `${RNFS.DocumentDirectoryPath}/${packageName}/CodePush`;
    await RNFS.exists(unzipFilePathDir).then((result) => {
      return RNFS.readDir(unzipFilePathDir).then(async (result) => {
        const listmodule = [];
        const fileTarget = result.filter((file) =>
          file.name.includes("index.android.bundle")
        );

        const renamePath = `${RNFS.DocumentDirectoryPath}/${packageName}/CodePush/main.jsbundle`;
        await RNFS.moveFile(fileTarget[0].path, renamePath);
        console.log("updateAppOnline", fileTarget[0].path);
        return listmodule;
      });
    });
  }
  const isSaved = await saveRemotePackageInfo(
    packageName,
    remotePackage,
    callbacks
  );

  if (!isSaved) {
    // handle save remote package info fail.
    onUpdateError &&
      onUpdateError({
        packageName,
        error: "Handle save remote package info fail.",
      });
  }
}

async function updateAppOffline(packageName, callbacks) {
  const { onUpdateError } = callbacks;
  const files =
    Platform.OS === "android"
      ? await RNFS.readDirAssets("modules")
      : await RNFS.readDir(`${RNFS.MainBundlePath}/modules`);
  const fileTarget = files.find((file) => `${packageName}.zip` === file.name);
  if (fileTarget) {
    const zipFilePath = `${RNFS.DocumentDirectoryPath}/${packageName}.zip`;
    if (Platform.OS === "android") {
      await RNFS.copyFileAssets(fileTarget.path, zipFilePath);
    } else {
      await RNFS.copyFile(fileTarget.path, zipFilePath);
    }
    const unzipFilePath = `${RNFS.DocumentDirectoryPath}/${packageName}`;
    const isUnzipDone = await unzipPackage(
      zipFilePath,
      unzipFilePath,
      callbacks
    );
    if (!isUnzipDone) {
      // handle unzip remote package fail.
      onUpdateError &&
        onUpdateError({
          packageName,
          error: "Handle unzip remote package fail.",
        });
      return;
    }

    const defaultRemotePackageInfo = {
      appVersion: "DEFAULT_VERSION",
      label: "DEFAULT_LABEL",
    };
    const isSaved = await saveRemotePackageInfo(
      packageName,
      defaultRemotePackageInfo,
      callbacks
    );
    if (!isSaved) {
      // handle save remote package info fail.
      onUpdateError &&
        onUpdateError({
          packageName,
          error: "Handle save remote package info fail.",
        });
    }
  } else {
    throw Error(
      `Must provide base version mini app zip folder as default for ${packageName}`
    );
  }
}

function getLatestRemotePackageInfo(deploymentKey, callbacks) {
  return new Promise((resolve, reject) => {
    const { onGetRemotePackageError, onProcess } = callbacks;
    codePush
      .checkForUpdate(deploymentKey)
      .then((remotePackage) => {
        log(`Get latest remote package DONE`);
        console.log("getLatestRemotePackageInfo", remotePackage, deploymentKey);
        onProcess && onProcess(3, 4);
        resolve(remotePackage);
      })
      .catch((error) => {
        log(`Get latest remote package FAIL`);
        onProcess && onProcess(3, 4);
        onGetRemotePackageError &&
          onGetRemotePackageError({ deploymentKey, error });
        resolve(null);
      });
  });
}

function downloadBundle(url, des, callbacks) {
  log(`Download jsbundle from ${url} to ${des} `);
  const {
    onDownloadBegin,
    onDownloadProgress,
    onDownloadFinish,
    onDownloadError,
  } = callbacks;
  return RNFS.downloadFile({
    fromUrl: url,
    toFile: des,
    progressInterval: 100,
    progressDivider: 1,
    begin: (res) => {
      onDownloadBegin && onDownloadBegin(res);
    },
    progress: (res) => {
      onDownloadProgress && onDownloadProgress(res);
    },
  })
    .promise.then((value) => {
      log("Download jsbundle DONE.");
      onDownloadFinish && onDownloadFinish(value);
      return true;
    })
    .catch((error) => {
      log("Download jsbundle Fail.");
      onDownloadError && onDownloadError(error);
      return false;
    });
}

function unzipPackage(source, target, callbacks) {
  const { onUnzipBegin, onUnzipFinish, onUnzipFail } = callbacks;
  onUnzipBegin && onUnzipBegin({});
  return unzip(source, target)
    .then((value) => {
      log(`Unzip DONE`);
      onUnzipFinish && onUnzipFinish(value);
      return true;
    })
    .catch((error) => {
      log(`Unzip FAIL`);
      onUnzipFail && onUnzipFail(error);
      return false;
    });
}

function saveRemotePackageInfo(key, value, callbacks) {
  const data = JSON.stringify(value);
  const { onSaveRemotePackageInfoError } = callbacks;
  return AsyncStorage.setItem(key, data)
    .then((_) => {
      log(`Save remote info DONE`);
      return true;
    })
    .catch((error) => {
      log(`Save remote info FAIL`);
      onSaveRemotePackageInfoError &&
        onSaveRemotePackageInfoError({ key, error });
      return false;
    });
}

function comparePackageVersion(localPackage, remotePackage) {
  if (remotePackage === null) {
    throw Error("Mini app has not announced any version yet.");
  }
  const mustUpdate =
    localPackage.appVersion !== remotePackage.appVersion ||
    localPackage.label !== remotePackage.label ||
    localPackage.deploymentKey !== remotePackage.deploymentKey;
  return mustUpdate;
}

function validateCallback(callbacks) {
  return callbacks || {};
}
