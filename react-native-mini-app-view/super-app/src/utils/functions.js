import AsyncStorage from "@react-native-async-storage/async-storage";

const IS_FIRST_TIME_OPEN_APP = "IS_FIRST_TIME_OPEN_APP"

export async function isOpenAppFisrtTime() {
    try {
        const isFisrtTime = await AsyncStorage.getItem(IS_FIRST_TIME_OPEN_APP)
        console.log(IS_FIRST_TIME_OPEN_APP, isFisrtTime);
        return isFisrtTime ? isFisrtTime === "YES" : true
    } catch (error) {
        return true
    }
}

export function nofityPassOpenAppFirstTime() {
    AsyncStorage.setItem(IS_FIRST_TIME_OPEN_APP, "NO")
}