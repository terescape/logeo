import Utils from 'misc/Utils';
import User from 'user/User';

'use strict'



class Logeo {
    constructor() {

        this._localUser = new User(this);

        this.urlParams = new URLSearchParams(window.location.search);
        if (debug) console.log('params: ' + window.location);

        this.serverConnection = null;

        this._iOS = Utils.iOS();

        this.timerID = 0;
    }

    start() {
        let localUser = this._localUser;
        localUser.uuid = Utils.createUuid();

        this.siteIntro();
    }

    siteIntro() {
        this.setupEventHandlers();
        //this.getParams();
    }

    initialize() {
        let localUser = this._localUser;

        // get user ip
        Utils.lookupIP(this.source, function(result) {
            localUser.ip = result;
            if (debug) window.console.log('callback result = ' + result);
        });


        let connectionOpenCallback = this.onConnectionOpen.bind(this);

        this.serverConnection = new WebSocket('wss://' + window.location.hostname + ':' + WS_PORT);

        this.serverConnection.onmessage = this.gotMessageFromServer;
        this.serverConnection.onopen = connectionOpenCallback;
        this.serverConnection.onclose = this.connectionClose();
    }

    connectionOpen() {
        let localRef = this;

        function keepAlive() {
            let timeout = 20000;
            if (localRef.serverConnection.readyState == localRef.serverConnection.OPEN) {
                localRef.serverConnection.send('');
                if (debug) console.log('keep alive');
            }
            localRef.timerID = setTimeout(keepAlive, timeout);
        }

        keepAlive();
    }

    connectionClose() {
        function cancelKeepAlive() {
            if (this.timerId) {
                clearTimeout(this.timerId);
            }
        }
    }

    setupEventHandlers() {
        window.addEventListener('resize', this.updateLayout.bind(this));
        window.addEventListener('orientationchange', this.updateLayout.bind(this));

        document.getElementById('choosefile').addEventListener('change', (event) => {
            this.selectImageAndLoad();
            document.getElementById('intro').style.display = "none";
            document.getElementById('result').style.display = "block";
            document.getElementById('decal').style.height = Math.floor(window.innerHeight / 4.0) + "px";
            this.initialize();
        }, false);
    }

    selectImageAndLoad(inputElement = 'choosefile') {
        // upload the track
        const selectedFile = document.getElementById(inputElement).files[0];

        if (debug) console.log('selected file ' + selectedFile.name);

        if (selectedFile)
            this.loadImage(selectedFile);
    }

    loadImage(selectedFile) {

        if (debug) console.log('selected file ' + selectedFile.name);

        let localRef = this;
        if (selectedFile) {

            if (debug) console.log('selected file: ' + selectedFile.name);

            const reader = new FileReader();
            reader.readAsArrayBuffer(selectedFile);

            reader.onload = (function () {



                return function (event) {
                    if (debug) console.log('decoded data');

                    /**
                    // Decode the audio data
                    localRef._audioContext.decodeAudioData(event.target.result, function (decodedData) {

                        if (debug) console.log('decoded data');

                        localRef.imgbuffer = decodedData;

                        localRef.imageLoaded = true;

                    }).catch(this.errorHandler);
                     **/
                };
            })();
        }
    }


    onConnectionOpen() {
        this.updateLayout();
    }

    // default initial handling of new message
    gotMessageFromServer(message) {
        var signal = JSON.parse(message.data);
        return signal;
    }

    updateLayout() {
        // placeholder
    }

    errorHandler(error) {
        window.console.log(error);
    }

}

export default Logeo