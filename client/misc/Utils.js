var Utils = {};


// Taken from http://stackoverflow.com/a/105074/515584
// Strictly speaking, it's not a real UUID, but it gets the job done here
Utils.createUuid = function() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
};


Utils.lookupIP = function(source, cb) {

    let request = new XMLHttpRequest();
    let ipUrl = "https://ipapi.co/json/"

    request.onload = data => Utils.parseIP(data, source, cb);
    request.open("get", ipUrl, true);
    request.send();
};

Utils.parseIP = function(data, source, cb) {
    let result = JSON.parse(data.target.response);
    if (source != 'screen')
        cb(result.ip);
}


Utils.iOS = function () {
    return [
            'iPad Simulator',
            'iPhone Simulator',
            'iPod Simulator',
            'iPad',
            'iPhone',
            'iPod'
        ].includes(navigator.platform)
        // iPad on iOS 13 detection
        || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
}


export default Utils;