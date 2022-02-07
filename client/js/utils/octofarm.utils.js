import { drawCamera } from "../templates/camera.template"

/**
 *
 * @param colour
 * @returns {{colourStyle: string, buttonStyle: string}}
 */
export function getNameColour(colour) {
    let colourStyle = `background-color: ${colour} !important;`;
    let buttonStyle = "btn-outline-dark";
    if (colour === "default") {
        colourStyle = "";
        buttonStyle = "btn-secondary";
    } else if (colour === "black") {
        buttonStyle = "btn-outline-light";
    }
    return {
        colourStyle,
        buttonStyle
    };
}

/**
 *
 * @param otherSettings
 * @returns {{flipV: string, rotate90: string, flipH: string}}
 */
export function isRotated(otherSettings) {
    let flipH = "";
    let flipV = "";
    let rotate90 = "";

    if (!!otherSettings) {
        if (otherSettings.webCamSettings.flipH) {
            flipH = "rotateY(180deg)";
        }
        if (otherSettings.webCamSettings.flipV) {
            flipV = "rotateX(180deg)";
        }
        if (otherSettings.webCamSettings.rotate90) {
            rotate90 = "rotate(90deg)";
        }
    }
    return { flipH, flipV, rotate90 };
}

/**
 *
 * @param state
 * @param clientSettings
 * @returns {string}
 */
export function isHidden(state, clientSettings) {
    let hidden = "";
    if (state === "Offline" && clientSettings.views.showOffline) {
        hidden = "hidden";
    } else if (state === "Disconnected" && clientSettings.views.showDisconnected) {
        hidden = "hidden";
    }
    return hidden;
}

/**
 *
 * @param clientSettings
 * @returns {number|{default: number, type: Number | NumberConstructor, required: boolean}|*}
 */
export function checkPrinterRows(clientSettings) {
    if (clientSettings) {
        return clientSettings.views.cameraColumns;
    } else {
        return 2;
    }
}

/**
 *
 * @param clientSettings
 * @returns {number|{default: number, type: Number | NumberConstructor, required: boolean}|*}
 */
export function checkGroupColumns(clientSettings) {
    if (clientSettings) {
        return clientSettings.views.groupColumns;
    } else {
        return 2;
    }
}

/**
 *
 * @param printer
 * @returns {string}
 */
export function imageOrCamera(printer) {
    const flip = isRotated(printer.otherSettings);
    const { flipH, flipV, rotate90 } = flip;

    //Is octoprints camera settings enabled?
    if (!!printer.otherSettings) {
        //Check if URL actually exists...
        if (printer.camURL !== "") {
            return drawCamera({
                url: printer.camURL,
                flipV,
                flipH,
                rotate90
            });
        } else {
            if (typeof printer.currentJob !== "undefined" && printer.currentJob.thumbnail != null) {
                return drawCamera({
                    url: printer.printerURL + "/" + printer.currentJob.thumbnail,
                    flipV,
                    flipH,
                    rotate90
                });
            } else {
                return drawCamera({
                    url: "../images/noCamera.jpg",
                    flipV,
                    flipH,
                    rotate90
                });
            }
        }
    } else {
        if (typeof printer.currentJob !== "undefined" && printer.currentJob.thumbnail != null) {
            return drawCamera({
                url: printer.printerURL + "/" + printer.currentJob.thumbnail,
                flipV,
                flipH,
                rotate90
            });
        } else {
            return drawCamera({ url: "", flipV, flipH, rotate90 });
        }
    }
}

/**
 *
 * @param printer
 * @returns {boolean}
 */
export function checkCameraState(printer) {
    //Is octoprints camera settings enabled?
    if (!!printer.otherSettings) {
        //Check if URL actually exists...
        if (printer.camURL !== "") {
            return true;
        } else {
            return typeof printer.currentJob !== "undefined" && printer.currentJob.thumbnail != null;
        }
    } else {
        return typeof printer.currentJob !== "undefined" && printer.currentJob.thumbnail != null;
    }
}