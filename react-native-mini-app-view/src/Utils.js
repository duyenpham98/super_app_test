
const showLog = !true;

export function log(...params) {
    showLog && console.log("[MiniAppView] " + params)
}

export function roundNumber(num, n = 0) {
    return Math.round(num * 10 ** n) / 10 ** n
}