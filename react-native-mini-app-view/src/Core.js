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

/*****************************************************************************
"Test01": {
            "packageName": "Test01_Module",
            "mainComponentName": "Test01",
            "deployments": {
                "staging": {
                    "android": "uO1_CJxa3rXy_veOwt7LDx2xjjgqtOXZV6uK6",
                    "ios": "jaosiiruw.JDGmvlepMeldJEincjsiwJdjj"
                },
                "production": {
                    "android": "H-fXucAtNfH9dq4HWX6p-SjsCqy-03IY0DDvZ",
                    "ios": "UUlfkjIUGldnLKJHdlMldkmdkf"
                }
            }
        }
********************************************************************************/

export async function checkVersionMultiMiniApp(env, miniApps, callbacks) {
  if (AsyncStorage === undefined) {
    throw Error("Must setup storage api first!");
  }
  console.log("CheckMiniapps" + JSON.stringify(miniApps))
  // checkVersionLocalMultiMiniApp(env, miniApps, callbacks)
  // return
  const _callback = validateCallback(callbacks);
  const tokens = Object.entries(miniApps);
  console.log("checkVersionMultiMiniApp" + tokens)
  const resultPromises = tokens.map(([miniAppName, miniAppInfo]) =>
    checkVersionMiniApp(env, { ...miniAppInfo, miniAppName }, _callback)
  );
  return Promise.all(resultPromises).then((results) => {
    console.log("resultPromises" + JSON.stringify(results))
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
    console.log("resultPromises1" + JSON.stringify(results))
    return {
      appsUpdateOnline,
      appsUpdateOffline,
      updateApps,
    };
  });
}
async function checkVersionLocalMultiMiniApp(env, miniApps, callbacks) {

  const tokens = Object.entries(miniApps);
  console.log("checkVersionLocalMultiMiniApptokens" + JSON.stringify(tokens))
  const _callback = validateCallback(callbacks);

  const promisesLocal = tokens.map(async ([miniAppNames, miniAppInfo]) => {
    const miniApp = { ...miniAppInfo, miniAppNames }
    const { packageName, mainComponentName, deployments, miniAppName } = miniApp;
    const localPackage = await getLocalPackageInfo(packageName, _callback);
    return {
      packageName,
      localPackage
    }
  });
  console.log("readDirAssets6", promisesLocal)
  const localApps = await getJsonListAppNeedUpdate(promisesLocal, tokens, RNFS.DocumentDirectoryPath, "local")
  // console.log("getJsonListAppNeedUpdate", localApps)


  const files =
    Platform.OS === "android"
      ? await RNFS.readDirAssets("modules")
      : await RNFS.readDir(`${RNFS.MainBundlePath}/modules`);
  const fileTarget = files.find((file) => `${"PaySlipMiniApp_Module"}.zip` === file.name);
  console.log("getJsonListAppNeedUpdate", await RNFS.exists(fileTarget.path))
  RNFS.readDir(unzipFilePathOld).then((result) => {
    console.log("getJsonListAppNeedUpdate", RNFS.exists(fileTarget.path))
  })
  // const incommingApps = await getJsonListAppNeedUpdate(promisesLocal, tokens, RNFS.DocumentDirectoryPath, "local")


}

async function getJsonListAppNeedUpdate(promises, tokens, path, TAG) {
  console.log(`checkVslocal_${TAG}`)
  const listmodule = []
  return Promise.all(promises).then((results) => {
    console.log(`checkVslocal_${TAG}` + JSON.stringify(results))
    const longtask = results.map(async (item, index) => {
      console.log(`unzipFilePathOld: ${TAG} ` + JSON.stringify(results))
      const unzipFilePathOld = `${path}/${item.packageName}/CodePush`;
      if (TAG == "incomming") {
        unzipFilePathOld = `${path}/${item.packageName}.zip/CodePush`;
      }
      try {
        const res = await getVersionLocal(unzipFilePathOld, tokens[index][1], index, TAG)
        return res
      } catch (e) {
        console.log("getVersionLocal", e)
      }
    })
    try {
      console.log("longtask", longtask)
      return Promise.all(longtask).then((results) => {
        console.log("longtask", results)
        return results
      })
    } catch (e) {
      console.log("longtask", e)
    }

  });
}
function getVersionLocal(unzipFilePathOld, data, index, TAG) {
  return RNFS.exists(unzipFilePathOld).then((result) => {
    return RNFS.readDir(unzipFilePathOld).then((result) => {
      const listmodule = []
      const ids = result.filter(file =>
        file.name.includes("txt")
      )
      if (ids) {
        listmodule.push({ packageName: data.packageName, filename: ids[0] ? ids[0].name : 0, index })
      }
      else {
        listmodule.push({ packageName: data.packageName, filename: '0', index })
      }
      return listmodule
    })
  }
  )
}
export async function checkVersionMiniApp(env, miniApp, callbacks) {
  console.log("checkVersionMiniApp2")
  const _callbacks = validateCallback(callbacks);
  const { packageName, mainComponentName, deployments, miniAppName } = miniApp;
  log(`Checking for update ${mainComponentName}`);
  const localPackage = await getLocalPackageInfo(packageName, _callbacks);
  const isOpenFirstTime = localPackage === null;
  const deploymentKey = getDeploymentKey(env, deployments);
  const remotePackage = await getLatestRemotePackageInfo(
    deploymentKey,
    _callbacks
  );
  const hasErrorOccur = remotePackage === null;

  const result = {
    miniAppName,
    packageName,
    deploymentKey,
    shouldUpdate: true,
    useLocal: true,
  };
  console.log("hasErrorOccur" + remotePackage)
  if (hasErrorOccur) {
    if (isOpenFirstTime) {
      console.log("force update local")
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
      console.log("comparePackageVersion",result)
    }
  }
  return result;
}

async function getLocalPackageInfo(packageName, callbacks) {
  try {
    console.log("getpackageName: " + packageName)
    const data = await AsyncStorage.getItem(packageName);
    console.log("getLocalPackageInfo: " + data)
    if (data) {
      const localPackage = JSON.parse(data);
      console.log("getLocalPackageInfo" + JSON.stringify(localPackage) + "---" + packageName)
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

  return null;
}

function getDeploymentKey(env, deployments) {
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

async function updateApps(miniAppsUpdate, callbacks) {
  const _callbacks = validateCallback(callbacks);
  const { onUnzipProgress, onUpdateBegin, onUpdateFinish } = _callbacks;
  console.log("updateApps" + JSON.stringify(miniAppsUpdate))
  console.log("updateAppOffline")
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
  console.log("updateAppOffline")
  const { onUpdateError } = callbacks;
  const files =
    Platform.OS === "android"
      ? await RNFS.readDirAssets("modules")
      : await RNFS.readDir(`${RNFS.MainBundlePath}/modules`);
  const fileTarget = files.find((file) => `${packageName}.zip` === file.name);
  if (fileTarget) {
    const zipFilePath = `${RNFS.DocumentDirectoryPath}/${packageName}.zip`;
    const unzipFilePathNew = `${RNFS.DocumentDirectoryPath}/${packageName}`;
    // delete file exist
    const listFile = [zipFilePath, unzipFilePathNew]
    listFile.map((path) => {
      RNFS.exists(path)
        .then((result) => {
          console.log("file exists: ", result);
          if (result) {
            return RNFS.unlink(path)
              .then(() => {
                console.log('FILE DELETED');
              })
              // `unlink` will throw an error, if the item to unlink does not exist
              .catch((err) => {
                console.log(err.message);
              });
          }
        })
        .catch((err) => {
          console.log(err.message);
        });
    })
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
    const { onGetRemotePackageError } = callbacks;
    codePush
      .checkForUpdate(deploymentKey)
      .then((remotePackage) => {
        log(`Get latest remote package DONE`);
        resolve(remotePackage);
      })
      .catch((error) => {
        log(`Get latest remote package FAIL`);
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
  console.log("comparePackageVersion")
  if (remotePackage === null) {
    throw Error("Mini app has not announced any version yet.");
  }
  console.log("comparePackageVersion" +
    JSON.stringify(remotePackage.appVersion) + "---" + localPackage.appVersion)
  const mustUpdate =
    localPackage.appVersion !== remotePackage.appVersion ||
    localPackage.label !== remotePackage.label ||
    localPackage.deploymentKey !== remotePackage.deploymentKey;
  return mustUpdate;
}

function validateCallback(callbacks) {
  return callbacks || {};
}
