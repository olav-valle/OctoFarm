import { ClientErrors } from "./exceptions/octofarm-client.exceptions";
const octoFarmErrorModalElement = "#octofarmErrorModal";

function returnErrorMessage(options) {
  let statusCode = `(${options?.statusCode})`;

  return `
     <br>
     ${options.name} ERROR ${statusCode}: 
     <br>
     <div class="py-3">
        Please report this error to <a href="https://github.com/octofarm/octofarm/issues">OctoFarm Issues</a>!
     </div>
     ${options.message}
  `;
}

function returnModalDeveloperInfo(options) {
  console.log(options.source);
  return `
    <code>
    <u>FILE INFO</u><br>
    LINE: ${options?.lineno}<br>
    COL: ${options?.colno}<br>
   
    ${options?.filename ? "FILE: " + options?.filename : ""}
    </code>
  `;
}

function openErrorModal(options) {
  if (!options.statusCode) {
    options.statusCode = ClientErrors.UNKNOWN_ERROR.statusCode;
    options.name = ClientErrors.UNKNOWN_ERROR.type;
  }
  const apiErrorTitle = document.getElementById("apiErrorTitle");
  const apiErrorMessage = document.getElementById("apiErrorMessage");
  const apiDeveloperInfo = document.getElementById("apiDeveloperInfo");
  apiErrorTitle.innerHTML = ` ${options?.name}`;
  apiErrorMessage.innerHTML = returnErrorMessage(options);
  apiErrorMessage.className = `text-${options?.color}`;
  apiDeveloperInfo.innerHTML = returnModalDeveloperInfo(options);
  $(octoFarmErrorModalElement).modal("show");
}

function handleEvent() {
  if (!event?.reason) {
    openErrorModal(event);
  } else {
    openErrorModal(event.reason);
    console.trace("TRACE BACK: ", JSON.stringify(event));
  }
}

// TODO fix this, it's not presenting the correct errors.l
window.onunhandledrejection = function (event) {
  // console.trace("UNHANDLED: ", JSON.stringify(event));
  // handleEvent(event);
  // event.preventDefault();
};
window.onerror = function (message, source, lineno, colno, error) {
  // console.trace("HANDLED: ", JSON.stringify({ message, source, lineno, colno, error }));
  // handleEvent({ message, source, lineno, colno, error });
};
