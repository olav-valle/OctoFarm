const { getPrinterStoreCache } = require("../../../cache/printer-store.cache");
const Logger = require("../../../handlers/logger");
const { PrinterTicker } = require("../../printer-connection-log.service");
const { SystemRunner } = require("../../system-information.service");
const { AppConstants } = require("../../../constants/app.constants");
const { ScriptRunner } = require("../../local-scripts.service");
const { clonePayloadDataForHistory } = require("../../../utils/mapping.utils");
const { parseOutIPAddress } = require("../../../utils/url.utils");
const { HistoryCollection } = require("../../history-capture.service.js");

const logger = new Logger("OctoFarm-State");

const tickerWrapper = (id, state, message) => {
  PrinterTicker.addIssue(new Date(), getPrinterStoreCache().getPrinterURL(id), message, state, id);
};

const captureClientAuthed = (id, data) => {
  let { networkIpAddresses } = SystemRunner.returnInfo();
  if (!networkIpAddresses) networkIpAddresses = [];
  const { remoteAddress, username } = data;

  let detectedAddress = "Socked Authed for: ";

  if (networkIpAddresses.includes(parseOutIPAddress(remoteAddress))) {
    detectedAddress += process.env[AppConstants.OCTOFARM_SITE_TITLE_KEY];
  } else if (!!remoteAddress) {
    detectedAddress += parseOutIPAddress(remoteAddress);
  } else {
    detectedAddress += "Unknown IP";
  }

  const currentUser = getPrinterStoreCache().getCurrentUser(id);
  let detectedUser = "";

  switch (currentUser) {
    case username:
      detectedUser += username;
      break;
    case null:
      detectedUser += "A pesky ghost (Don't know who)";
      break;
    default:
      detectedUser += currentUser;
  }
  const message = `${detectedAddress} with user: ${detectedUser}`;
  logger.warning(message);
  tickerWrapper(id, "Complete", message);
  ScriptRunner.check(getPrinterStoreCache().getPrinter(id), "clientauthed", undefined)
    .then((res) => {
      logger.info("Successfully checked client authed script", res);
      return res;
    })
    .catch((e) => {
      logger.error("Failed to check client authed script", e);
    });
};
const captureClientClosed = (id, data) => {
  let { networkIpAddresses } = SystemRunner.returnInfo();

  if (!networkIpAddresses) networkIpAddresses = [];
  const { remoteAddress } = data;

  let detectedAddress = "Socket was closed for: ";
  if (networkIpAddresses.includes(parseOutIPAddress(remoteAddress))) {
    detectedAddress += process.env[AppConstants.OCTOFARM_SITE_TITLE_KEY];
  } else if (!!remoteAddress) {
    detectedAddress += parseOutIPAddress(remoteAddress);
  } else {
    detectedAddress += "Unknown IP";
  }
  logger.warning(detectedAddress);
  tickerWrapper(id, "Info", detectedAddress);
  ScriptRunner.check(getPrinterStoreCache().getPrinter(id), "clientclosed", undefined)
    .then((res) => {
      logger.info("Successfully checked client closed script", res);
      return res;
    })
    .catch((e) => {
      logger.error("Failed to check client closed script", e);
    });
};
const captureClientOpened = (id, data) => {
  let { networkIpAddresses } = SystemRunner.returnInfo();
  if (!networkIpAddresses) networkIpAddresses = [];

  const { remoteAddress } = data;

  let detectedAddress = "Socket Opened for: ";
  if (networkIpAddresses.includes(parseOutIPAddress(remoteAddress))) {
    detectedAddress += process.env[AppConstants.OCTOFARM_SITE_TITLE_KEY];
  } else if (!!remoteAddress) {
    detectedAddress += parseOutIPAddress(remoteAddress);
  } else {
    detectedAddress += "Unknown IP";
  }
  logger.warning(detectedAddress);
  tickerWrapper(id, "Info", detectedAddress);
  ScriptRunner.check(getPrinterStoreCache().getPrinter(id), "clientopened", undefined)
    .then((res) => {
      logger.info("Successfully checked client opened script", res);
      return res;
    })
    .catch((e) => {
      logger.error("Failed to check client opened script", e);
    });
};
const captureConnected = (id, data) => {
  ScriptRunner.check(getPrinterStoreCache().getPrinter(id), "connected", undefined)
    .then((res) => {
      logger.info("Successfully checked connected script", res);
      return res;
    })
    .catch((e) => {
      logger.error("Failed to check connected script", e);
    });
};
const captureDisconnecting = (id, data) => {
  ScriptRunner.check(getPrinterStoreCache().getPrinter(id), "disconnecting", undefined)
    .then((res) => {
      logger.info("Successfully checked disconnecting script", res);
      return res;
    })
    .catch((e) => {
      logger.error("Failed to check disconnecting script", e);
    });
};
const captureDisconnected = (id, data) => {
  ScriptRunner.check(getPrinterStoreCache().getPrinter(id), "disconnected", undefined)
    .then((res) => {
      logger.info("Successfully checked disconnected script", res);
      return res;
    })
    .catch((e) => {
      logger.error("Failed to check disconnected script", e);
    });
};
const captureDwelling = (id, data) => {
  ScriptRunner.check(getPrinterStoreCache().getPrinter(id), "dwelling", undefined)
    .then((res) => {
      logger.info("Successfully checked dwelling script", res);
      return res;
    })
    .catch((e) => {
      logger.error("Failed to check dwelling script", e);
    });
};
const captureError = (id, data) => {
  const { payloadData, printer, job, files, resendStats } = clonePayloadDataForHistory(
    data,
    getPrinterStoreCache().getPrinter(id)
  );

  // Register cancelled print...
  HistoryCollection.errorLog(payloadData, printer, job, files, resendStats)
    .then((res) => {
      logger.info("Successfully captured error", res);
      setTimeout(async function () {
        // Register cancelled print...

        // await Runner.updateFilament();
        // TODO Update Printer Manager call to update filament... or maybe register as a task and call

        setTimeout(async function () {
          // TODO This is something that can be fired from the store...
          // await Runner.reSyncFile(
          //   farmPrinters[that.index]._id,
          //   farmPrinters[that.index].job.file.path
          // );
        }, 5000);
      }, 10000);
    })
    .catch((e) => {
      logger.error("Failed to capture error", e);
    });
};
const captureFileAdded = (id, data) => {
  ScriptRunner.check(getPrinterStoreCache().getPrinter(id), "fileadded", undefined)
    .then((res) => {
      logger.info("Successfully checked file added script", res);
      return res;
    })
    .catch((e) => {
      logger.error("Failed to check file added script", e);
    });
};
const captureFileDeselected = (id, data) => {
  ScriptRunner.check(getPrinterStoreCache().getPrinter(id), "filedeselected", undefined)
    .then((res) => {
      logger.info("Successfully checked file deselected script", res);
      return res;
    })
    .catch((e) => {
      logger.error("Failed to check file deselected script", e);
    });
};
const captureFileRemoved = (id, data) => {
  ScriptRunner.check(getPrinterStoreCache().getPrinter(id), "fileremoved", undefined)
    .then((res) => {
      logger.info("Successfully checked file removed script", res);
      return res;
    })
    .catch((e) => {
      logger.error("Failed to check fil eremoved script", e);
    });
};
const captureFirmwareData = (id, data) => {
  const { name } = data;
  logger.warning("Updating printer firmware version", name);
  getPrinterStoreCache().updatePrinterDatabase(id, {
    printerFirmware: name
  });
};
const captureFolderAdded = (id, data) => {
  ScriptRunner.check(getPrinterStoreCache().getPrinter(id), "folderadded", undefined)
    .then((res) => {
      logger.info("Successfully checked folder added script", res);
      return res;
    })
    .catch((e) => {
      logger.error("Failed to check folder added script", e);
    });
};
const captureFolderRemoved = (id, data) => {
  ScriptRunner.check(getPrinterStoreCache().getPrinter(id), "folderremoved", undefined)
    .then((res) => {
      logger.info("Successfully checked folder removed script", res);
      return res;
    })
    .catch((e) => {
      logger.error("Failed to check folder removed script", e);
    });
};
const captureHome = (id, data) => {
  ScriptRunner.check(getPrinterStoreCache().getPrinter(id), "homed", undefined)
    .then((res) => {
      logger.info("Successfully checked homed script", res);
      return res;
    })
    .catch((e) => {
      logger.error("Failed to check homed script", e);
    });
};
const captureMetadataAnalysisFinished = (id, data) => {
  ScriptRunner.check(getPrinterStoreCache().getPrinter(id), "metadatafinished", undefined)
    .then((res) => {
      logger.info("Successfully checked metadata finished script", res);
      return res;
    })
    .catch((e) => {
      logger.error("Failed to check metadata finished script", e);
    });
};
const captureMetadataAnalysisStarted = (id, data) => {
  ScriptRunner.check(getPrinterStoreCache().getPrinter(id), "metadatastarted", undefined)
    .then((res) => {
      logger.info("Successfully checked metadata started script", res);
      return res;
    })
    .catch((e) => {
      logger.error("Failed to check metadata started script", e);
    });
};
const captureMetadataStatisticsUpdated = (id, data) => {
  ScriptRunner.check(getPrinterStoreCache().getPrinter(id), "metadataupdated", undefined)
    .then((res) => {
      logger.info("Successfully checked metadata updated script", res);
      return res;
    })
    .catch((e) => {
      logger.error("Failed to check metadata updated script", e);
    });
};
const capturePositionUpdate = (id, data) => {
  ScriptRunner.check(getPrinterStoreCache().getPrinter(id), "positionupdated", undefined)
    .then((res) => {
      logger.info("Successfully checked position updated script", res);
      return res;
    })
    .catch((e) => {
      logger.error("Failed to check position updated script", e);
    });
};
const capturePrintCancelled = (id, data) => {
  ScriptRunner.check(getPrinterStoreCache().getPrinter(id), "cancelled", undefined)
    .then((res) => {
      logger.info("Successfully checked cancelled script", res);
      return res;
    })
    .catch((e) => {
      logger.error("Failed to check cancelled script", e);
    });
};
const capturePrintCancelling = (id, data) => {
  ScriptRunner.check(getPrinterStoreCache().getPrinter(id), "cancelling", undefined)
    .then((res) => {
      logger.info("Successfully checked cancelling script", res);
      return res;
    })
    .catch((e) => {
      logger.error("Failed to check cancelling script", e);
    });
};
const captureFinishedPrint = (id, data, success) => {
  const { payloadData, printer, job, files, resendStats } = clonePayloadDataForHistory(
    data,
    getPrinterStoreCache().getPrinter(id)
  );
  HistoryCollection.capturePrint(payloadData, printer, job, files, resendStats, success)
    .then((res) => {
      logger.info("Successfully captured print!", res);

      setTimeout(async function () {
        // Register cancelled print...

        // await Runner.updateFilament();
        // TODO Update Printer Manager call to update filament... or maybe register as a task and call

        setTimeout(async function () {
          // TODO This is something that can be fired from the store...
          // await Runner.reSyncFile(
          //   farmPrinters[that.index]._id,
          //   farmPrinters[that.index].job.file.path
          // );
        }, 5000);
      }, 10000);
    })
    .catch((e) => {
      logger.error("Failed to capture print!", e);
    });
  ScriptRunner.check(getPrinterStoreCache().getPrinter(id), "connected", undefined)
    .then((res) => {
      logger.info("Successfully checked connected script", res);
      return res;
    })
    .catch((e) => {
      logger.error("Failed to check connected script", e);
    });
};
const capturePrintPaused = (id) => {
  ScriptRunner.check(getPrinterStoreCache().getPrinter(id), "paused", undefined)
    .then((res) => {
      logger.info("Successfully checked paused script", res);
      return res;
    })
    .catch((e) => {
      logger.error("Failed to check paused script", e);
    });
};
const capturePrintStarted = (id, data) => {
  ScriptRunner.check(getPrinterStoreCache().getPrinter(id), "started", undefined)
    .then((res) => {
      logger.info("Successfully checked started script", res);
      return res;
    })
    .catch((e) => {
      logger.error("Failed to check started script", e);
    });
};
const capturePrinterStateChanged = (id, data) => {
  ScriptRunner.check(getPrinterStoreCache().getPrinter(id), "statechange", undefined)
    .then((res) => {
      logger.info("Successfully checked statechange script", res);
      return res;
    })
    .catch((e) => {
      logger.error("Failed to check statechange script", e);
    });
};
const captureTransferDone = (id, data) => {
  ScriptRunner.check(getPrinterStoreCache().getPrinter(id), "fileupload", undefined)
    .then((res) => {
      logger.info("Successfully checked file upload script", res);
      return res;
    })
    .catch((e) => {
      logger.error("Failed to check file upload script", e);
    });
};
const captureTransferStarted = (id, data) => {
  ScriptRunner.check(getPrinterStoreCache().getPrinter(id), "fileuploading", undefined)
    .then((res) => {
      logger.info("Successfully checked file uploading script", res);
      return res;
    })
    .catch((e) => {
      logger.error("Failed to check file uploading script", e);
    });
};
const captureUpdatedFiles = (id, data) => {
  ScriptRunner.check(getPrinterStoreCache().getPrinter(id), "fileupdate", undefined)
    .then((res) => {
      logger.info("Successfully checked file update script", res);
      return res;
    })
    .catch((e) => {
      logger.error("Failed to check file update script", e);
    });
};
const captureUpload = (id, data) => {
  ScriptRunner.check(getPrinterStoreCache().getPrinter(id), "fileupload", undefined)
    .then((res) => {
      logger.info("Successfully checked file upload script", res);
      return res;
    })
    .catch((e) => {
      logger.error("Failed to check file upload script", e);
    });
};
const captureUserLoggedOut = (id, data) => {
  const currentUser = getPrinterStoreCache().getCurrentUser(id);
  let detectedUser = "User: ";
  const hasLoggedOut = " has logged out of OctoPrint.";

  switch (currentUser) {
    case data.username:
      detectedUser += data.username;
      break;
    case null:
      detectedUser += "A pesky ghost (Don't know who)";
      break;
    default:
      detectedUser += currentUser;
  }
  logger.warning(detectedUser + hasLoggedOut);
  tickerWrapper(id, "Info", detectedUser + hasLoggedOut);
};
const captureUserLoggedIn = (id, data) => {
  const currentUser = getPrinterStoreCache().getCurrentUser(id);
  let detectedUser = "User: ";
  const hasLoggedIn = " has logged in to OctoPrint.";

  switch (currentUser) {
    case data.username:
      detectedUser += data.username;
      break;
    case null:
      detectedUser += "A pesky ghost (Don't know who)";
      break;
    default:
      detectedUser += currentUser;
  }
  logger.warning(detectedUser + hasLoggedIn);
  tickerWrapper(id, "Info", detectedUser + hasLoggedIn);
};
const captureZChange = (id, data) => {
  ScriptRunner.check(getPrinterStoreCache().getPrinter(id), "zchange", undefined)
    .then((res) => {
      logger.info("Successfully checked zchange script", res);
      return res;
    })
    .catch((e) => {
      logger.error("Failed to check zchange script", e);
    });
};

module.exports = {
  captureClientAuthed,
  captureClientClosed,
  captureClientOpened,
  captureConnected,
  captureDisconnecting,
  captureDisconnected,
  captureDwelling,
  captureError,
  captureFileAdded,
  captureFileDeselected,
  captureFileRemoved,
  captureFirmwareData,
  captureFolderAdded,
  captureFolderRemoved,
  captureHome,
  captureMetadataAnalysisFinished,
  captureMetadataAnalysisStarted,
  captureMetadataStatisticsUpdated,
  capturePositionUpdate,
  capturePrintCancelled,
  capturePrintCancelling,
  captureFinishedPrint,
  capturePrintPaused,
  capturePrintStarted,
  capturePrinterStateChanged,
  captureTransferDone,
  captureTransferStarted,
  captureUpdatedFiles,
  captureUpload,
  captureUserLoggedIn,
  captureUserLoggedOut,
  captureZChange
};