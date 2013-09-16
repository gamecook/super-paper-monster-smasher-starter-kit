window.console = {
    log: function (str) { window.external.Notify(str); }
};

// output errors to console log
window.onerror = function (e) {
    console.log("window.onerror ::" + JSON.stringify(e));
};

console.log("Installed console !");