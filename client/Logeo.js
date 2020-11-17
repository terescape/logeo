import Utils from 'misc/Utils';
import User from 'user/User';

//import * as THREE from 'https://unpkg.com/three@0.119.0/build/three.module.js';

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

        this.requestStatus.bind(this);
        this.requestContent.bind(this);

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
            reader.readAsDataURL(selectedFile);

            //const group = new THREE.Group();
            //loadSVGObject(null);

            reader.onload = function () {

                let img = document.getElementById('oldlogo')
                img.src = reader.result;
                if (img.width > 300)
                    img.width = 300;

                console.log("image width: " + document.getElementById('oldlogo').width);

                if (debug) console.log('decoded data');
// TESTING
                //let enc = 'PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/Pgo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDIwMDEwOTA0Ly9FTiIKICJodHRwOi8vd3d3LnczLm9yZy9UUi8yMDAxL1JFQy1TVkctMjAwMTA5MDQvRFREL3N2ZzEwLmR0ZCI+CjxzdmcgdmVyc2lvbj0iMS4wIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiB3aWR0aD0iMjAwMC4wMDAwMDBwdCIgaGVpZ2h0PSIyMDAwLjAwMDAwMHB0IiB2aWV3Qm94PSIwIDAgMjAwMC4wMDAwMDAgMjAwMC4wMDAwMDAiCiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJ4TWlkWU1pZCBtZWV0Ij4KCjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAuMDAwMDAwLDIwMDAuMDAwMDAwKSBzY2FsZSgwLjEwMDAwMCwtMC4xMDAwMDApIgpmaWxsPSIjMDAwMDAwIiBzdHJva2U9Im5vbmUiPgo8cGF0aCBkPSJNOTU3MCAxOTkwNCBjLTMwIC0yIC0xMzQgLTggLTIzMCAtMTQgLTExMzMgLTcxIC0yMjc2IC0zNTIgLTMzNTAKLTgyNSAtMzc4IC0xNjcgLTg1MyAtNDIwIC0xMjI1IC02NTIgLTE3OTkgLTExMjQgLTMxODUgLTI3ODIgLTM5NzcgLTQ3NTMKLTMzMiAtODI2IC01NTQgLTE3MzEgLTY0NyAtMjY0MCAtNDAgLTM4NCAtNDYgLTUxNyAtNDYgLTEwMTAgMCAtNTYzIDIwIC04NzQKODYgLTEzNTAgMzQ2IC0yNTAzIDE2NDUgLTQ3NzggMzYzOSAtNjM3NiAxMDA5IC04MDkgMjE3OCAtMTQxNyAzNDE1IC0xNzc4CjEyOTkgLTM3OCAyNjY5IC00ODQgNDAyNSAtMzEwIDE5MzkgMjQ4IDM3NjggMTA3OSA1MjU1IDIzODUgNTE3IDQ1NSA5OTMgOTcxCjE0MDYgMTUyNSA2NzYgOTA2IDExOTEgMTkxNSAxNTI0IDI5ODQgNTI4IDE3MDEgNTgzIDM1MzMgMTU5IDUyNzAgLTY1NiAyNjgzCi0yNDM4IDUwMDEgLTQ4NjkgNjMzNSAtMTI2MyA2OTMgLTI1OTIgMTA4MyAtNDA4MCAxMTk1IC0xMzYgMTEgLTk3NCAyMSAtMTA4NQoxNHogbTEwMTUgLTEyNjQgYzExODIgLTkyIDIyMjEgLTM3NSAzMjM1IC04ODEgNjgxIC0zNDAgMTI3NyAtNzQwIDE4NjggLTEyNTUKMTkwIC0xNjUgNjIyIC01OTcgNzg3IC03ODcgMTA5MCAtMTI1MiAxNzgyIC0yNzExIDIwNDUgLTQzMDYgODAgLTQ5MCAxMTEKLTg4MCAxMTEgLTE0MTEgLTEgLTEzMzkgLTI5MiAtMjU5MSAtODgxIC0zNzg1IC00MzggLTg4NyAtOTg4IC0xNjQ4IC0xNjk3Ci0yMzQ1IC0yMzUgLTIzMiAtMzM0IC0zMjIgLTU0OSAtNTAxIC0yMDA1IC0xNjY5IC00NjQ0IC0yMzM5IC03MjA2IC0xODI4Ci0xNjEzIDMyMSAtMzEyNSAxMTE5IC00MzE5IDIyNzcgLTE0NzIgMTQyNyAtMjM4NCAzMzA5IC0yNTg4IDUzMzcgLTU4IDU4MQotNTMgMTI3MCAxNSAxODUwIDI1NiAyMjAzIDEzNTggNDIyOCAzMDc5IDU2NjAgMTQzNCAxMTkzIDMxODkgMTg4MCA1MDcwIDE5ODUKMTg2IDEwIDg1NSA0IDEwMzAgLTEweiIvPgo8cGF0aCBkPSJNOTYwNSAxNzQxOSBjLTQ0NyAtMjQgLTkwNSAtODkgLTEzMzAgLTE5MSAtNzEgLTE3IC0xMzEgLTMyIC0xMzMKLTMzIC0yIC0yIDQxOCAtMTE2NyA5MzQgLTI1OTAgNTM4IC0xNDgzIDk0MSAtMjU4MSA5NDUgLTI1NzMgNCA3IDQyNCAxMTY3CjkzNCAyNTc4IDUxMCAxNDExIDkyOSAyNTY4IDkzMCAyNTcxIDUgOCAtMjI5IDY0IC00NTUgMTA5IC01NzUgMTE0IC0xMjMxIDE2MQotMTgyNSAxMjl6Ii8+CjxwYXRoIGQ9Ik02MTE5IDE2MzM5IGMtNTIzIC0zMjMgLTk4NSAtNjkyIC0xNDI5IC0xMTQ1IC0xNTYgLTE1OSAtNDQ4IC00ODYKLTQ3MiAtNTI4IC00IC03IDY4OSAtMTgxOCAxNTQwIC00MDI0IDg1MCAtMjIwNyAxNTQ5IC00MDA2IDE1NTMgLTQwMDAgNCA3CjIzNyA2MDkgNTE5IDEzMzggMjgyIDcyOSA1MzQgMTM4MiA1NjIgMTQ1MyBsNDkgMTI3IDE0OTEgLTIgMTQ5MCAtMyA1NTkKLTE0NDUgYzMwNyAtNzk1IDU2MiAtMTQ1MyA1NjcgLTE0NjQgNiAtMTMgNDE3IDEwNDUgMTU3MSA0MDQyIDk0MiAyNDQ4IDE1NjAKNDA2NiAxNTU1IDQwNzQgLTQgNyAtNDggNjAgLTk4IDExOCAtNDgzIDU1OCAtMTA3NCAxMDYyIC0xNjk5IDE0NTAgLTgyIDUwCi0xNTAgOTAgLTE1MiA4OCAtMiAtMiAtNDkxIC0xMzQ2IC0xMDg3IC0yOTg4IGwtMTA4MyAtMjk4NSAtMTUzOSAwIC0xNTM5IDAKLTEwODggMjk5NSBjLTU5NyAxNjQ3IC0xMDkxIDI5OTYgLTEwOTYgMjk5NyAtNSAyIC04MyAtNDIgLTE3NCAtOTh6Ii8+CjxwYXRoIGQ9Ik0xNTE3NyA4MDM3IGMtOTY2IC0yNTIwIC0xNzU3IC00NTg2IC0xNzU3IC00NTkxIDAgLTE3IDM3NyAyMDAgNjA2CjM0OSA2MTYgNDAxIDEyMTcgOTQxIDE2OTggMTUyNSA4NjcgMTA1MSAxNDQwIDIzNzAgMTYxNiAzNzIwIDcwIDU0MyA4MCAxMjA5CjI0IDE3NTAgLTQ4IDQ3MSAtMTQ3IDk2NCAtMjgzIDE0MTEgLTU1IDE4MCAtMTMwIDM5OSAtMTQxIDQxMiAtNCA0IC03OTcKLTIwNTUgLTE3NjMgLTQ1NzZ6Ii8+CjxwYXRoIGQ9Ik0yOTI2IDEyMjc4IGMtMzY1IC0xMTM2IC00NTAgLTIzMzAgLTI1MCAtMzUxMyAzMDAgLTE3NzQgMTI2MiAtMzQwNAoyNjc5IC00NTM2IDE4MyAtMTQ3IDMzOSAtMjU5IDU1OSAtNDA0IDE4OCAtMTI0IDQ5NiAtMzA5IDUwMyAtMzAxIDUgNSAtMzQyMQo4OTI2IC0zNDI4IDg5MjYgLTQgMCAtMzIgLTc4IC02MyAtMTcyeiIvPgo8cGF0aCBkPSJNODk2OCA1NDg2IGMtOTQ0IC0yNDQ3IC05NTggLTI0ODQgLTk1OCAtMjU1MyAwIC02NSAyIC03MSAyMyAtNzcKNDU3IC0xMjggOTcyIC0yMTMgMTQ5MiAtMjQ2IDIwMyAtMTMgNzM0IC0xMyA5MzAgMCAzMTIgMjEgNjMzIDYxIDkyNiAxMTUgMTU3CjI4IDQ1MyA5NSA0NjkgMTA1IDEwIDYgMTAgMjcgMCA5NiAtMTEgODAgLTExMCAzNDEgLTk1NSAyNTM0IC01MTggMTM0NSAtOTQ5CjI0NjAgLTk1NiAyNDc3IC0xNCAzMiAtMzEgLTExIC05NzEgLTI0NTF6Ii8+CjwvZz4KPC9zdmc+Cg==';
                //let dec = atob(enc);
                //console.log(dec)

                //let div = document.getElementById('svgdiv');
                //div.innerHTML = dec;

                localRef.initializeThreejs();

//TESTING

                let base64data = reader.result.substring(reader.result.indexOf(",") + 1);
 /**
                fetch('https://api.convertio.co/convert',
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            "apikey": "63d95b7d23f9e6d96de0d9cebb763c2f",
                            "input": "base64",
                            "filename": selectedFile.name,
                            "file": base64data,
                            "outputformat": "svg"
                        })
                    }).then(response => response.json())
                    .then(data => localRef.requestStatus(data));
**/
            };
        }
    }

    requestStatus(jobresponse) {
        let localRef = this;

        if (debug) console.log(jobresponse);

        if (debug) console.log("job response code: " + jobresponse.code);

        if (jobresponse.code === 200) {
            // request job status
            fetch('https://api.convertio.co/convert/' + jobresponse.data.id + '/status',
                {
                    method: 'GET'
                }).then(response => response.json())
                .then(data => localRef.requestContent(data, jobresponse));
        } else {
            // TODO: show error on screen
            console.log("error: " + jobresponse.code);

            //wait and try again

        }

    }

    requestContent(statusresponse, jobresponse) {
        let localRef = this;

        if (debug) window.console.log("status response code: " + statusresponse.code);

        if (debug) window.console.log(statusresponse);

        if (statusresponse.code === 200 && statusresponse.data.step === "finish" && statusresponse.data.step_percent === 100) {
            // success
            if (debug) window.console.log("time to fetch the image!");

            // request svg
            fetch('https://api.convertio.co/convert/' + jobresponse.data.id + '/dl',
                {
                    method: 'GET'
                }).then(response => response.json())
                .then(data => localRef.handleContent(data, jobresponse));
        } else {
            // wait and check status again
            if(debug) console.log("waiting and checking status again.")

            setTimeout(localRef.requestStatus(jobresponse), 4000);
        }
    }

    handleContent(contentresponse, jobresponse) {
        let localRef = this;

        if (debug) console.log(contentresponse);

        if (debug) console.log("content response code: " + contentresponse.code);

        if (contentresponse.code === 200) {

            //let enc = 'PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/Pgo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDIwMDEwOTA0Ly9FTiIKICJodHRwOi8vd3d3LnczLm9yZy9UUi8yMDAxL1JFQy1TVkctMjAwMTA5MDQvRFREL3N2ZzEwLmR0ZCI+CjxzdmcgdmVyc2lvbj0iMS4wIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiB3aWR0aD0iMjAwMC4wMDAwMDBwdCIgaGVpZ2h0PSIyMDAwLjAwMDAwMHB0IiB2aWV3Qm94PSIwIDAgMjAwMC4wMDAwMDAgMjAwMC4wMDAwMDAiCiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJ4TWlkWU1pZCBtZWV0Ij4KCjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAuMDAwMDAwLDIwMDAuMDAwMDAwKSBzY2FsZSgwLjEwMDAwMCwtMC4xMDAwMDApIgpmaWxsPSIjMDAwMDAwIiBzdHJva2U9Im5vbmUiPgo8cGF0aCBkPSJNOTU3MCAxOTkwNCBjLTMwIC0yIC0xMzQgLTggLTIzMCAtMTQgLTExMzMgLTcxIC0yMjc2IC0zNTIgLTMzNTAKLTgyNSAtMzc4IC0xNjcgLTg1MyAtNDIwIC0xMjI1IC02NTIgLTE3OTkgLTExMjQgLTMxODUgLTI3ODIgLTM5NzcgLTQ3NTMKLTMzMiAtODI2IC01NTQgLTE3MzEgLTY0NyAtMjY0MCAtNDAgLTM4NCAtNDYgLTUxNyAtNDYgLTEwMTAgMCAtNTYzIDIwIC04NzQKODYgLTEzNTAgMzQ2IC0yNTAzIDE2NDUgLTQ3NzggMzYzOSAtNjM3NiAxMDA5IC04MDkgMjE3OCAtMTQxNyAzNDE1IC0xNzc4CjEyOTkgLTM3OCAyNjY5IC00ODQgNDAyNSAtMzEwIDE5MzkgMjQ4IDM3NjggMTA3OSA1MjU1IDIzODUgNTE3IDQ1NSA5OTMgOTcxCjE0MDYgMTUyNSA2NzYgOTA2IDExOTEgMTkxNSAxNTI0IDI5ODQgNTI4IDE3MDEgNTgzIDM1MzMgMTU5IDUyNzAgLTY1NiAyNjgzCi0yNDM4IDUwMDEgLTQ4NjkgNjMzNSAtMTI2MyA2OTMgLTI1OTIgMTA4MyAtNDA4MCAxMTk1IC0xMzYgMTEgLTk3NCAyMSAtMTA4NQoxNHogbTEwMTUgLTEyNjQgYzExODIgLTkyIDIyMjEgLTM3NSAzMjM1IC04ODEgNjgxIC0zNDAgMTI3NyAtNzQwIDE4NjggLTEyNTUKMTkwIC0xNjUgNjIyIC01OTcgNzg3IC03ODcgMTA5MCAtMTI1MiAxNzgyIC0yNzExIDIwNDUgLTQzMDYgODAgLTQ5MCAxMTEKLTg4MCAxMTEgLTE0MTEgLTEgLTEzMzkgLTI5MiAtMjU5MSAtODgxIC0zNzg1IC00MzggLTg4NyAtOTg4IC0xNjQ4IC0xNjk3Ci0yMzQ1IC0yMzUgLTIzMiAtMzM0IC0zMjIgLTU0OSAtNTAxIC0yMDA1IC0xNjY5IC00NjQ0IC0yMzM5IC03MjA2IC0xODI4Ci0xNjEzIDMyMSAtMzEyNSAxMTE5IC00MzE5IDIyNzcgLTE0NzIgMTQyNyAtMjM4NCAzMzA5IC0yNTg4IDUzMzcgLTU4IDU4MQotNTMgMTI3MCAxNSAxODUwIDI1NiAyMjAzIDEzNTggNDIyOCAzMDc5IDU2NjAgMTQzNCAxMTkzIDMxODkgMTg4MCA1MDcwIDE5ODUKMTg2IDEwIDg1NSA0IDEwMzAgLTEweiIvPgo8cGF0aCBkPSJNOTYwNSAxNzQxOSBjLTQ0NyAtMjQgLTkwNSAtODkgLTEzMzAgLTE5MSAtNzEgLTE3IC0xMzEgLTMyIC0xMzMKLTMzIC0yIC0yIDQxOCAtMTE2NyA5MzQgLTI1OTAgNTM4IC0xNDgzIDk0MSAtMjU4MSA5NDUgLTI1NzMgNCA3IDQyNCAxMTY3CjkzNCAyNTc4IDUxMCAxNDExIDkyOSAyNTY4IDkzMCAyNTcxIDUgOCAtMjI5IDY0IC00NTUgMTA5IC01NzUgMTE0IC0xMjMxIDE2MQotMTgyNSAxMjl6Ii8+CjxwYXRoIGQ9Ik02MTE5IDE2MzM5IGMtNTIzIC0zMjMgLTk4NSAtNjkyIC0xNDI5IC0xMTQ1IC0xNTYgLTE1OSAtNDQ4IC00ODYKLTQ3MiAtNTI4IC00IC03IDY4OSAtMTgxOCAxNTQwIC00MDI0IDg1MCAtMjIwNyAxNTQ5IC00MDA2IDE1NTMgLTQwMDAgNCA3CjIzNyA2MDkgNTE5IDEzMzggMjgyIDcyOSA1MzQgMTM4MiA1NjIgMTQ1MyBsNDkgMTI3IDE0OTEgLTIgMTQ5MCAtMyA1NTkKLTE0NDUgYzMwNyAtNzk1IDU2MiAtMTQ1MyA1NjcgLTE0NjQgNiAtMTMgNDE3IDEwNDUgMTU3MSA0MDQyIDk0MiAyNDQ4IDE1NjAKNDA2NiAxNTU1IDQwNzQgLTQgNyAtNDggNjAgLTk4IDExOCAtNDgzIDU1OCAtMTA3NCAxMDYyIC0xNjk5IDE0NTAgLTgyIDUwCi0xNTAgOTAgLTE1MiA4OCAtMiAtMiAtNDkxIC0xMzQ2IC0xMDg3IC0yOTg4IGwtMTA4MyAtMjk4NSAtMTUzOSAwIC0xNTM5IDAKLTEwODggMjk5NSBjLTU5NyAxNjQ3IC0xMDkxIDI5OTYgLTEwOTYgMjk5NyAtNSAyIC04MyAtNDIgLTE3NCAtOTh6Ii8+CjxwYXRoIGQ9Ik0xNTE3NyA4MDM3IGMtOTY2IC0yNTIwIC0xNzU3IC00NTg2IC0xNzU3IC00NTkxIDAgLTE3IDM3NyAyMDAgNjA2CjM0OSA2MTYgNDAxIDEyMTcgOTQxIDE2OTggMTUyNSA4NjcgMTA1MSAxNDQwIDIzNzAgMTYxNiAzNzIwIDcwIDU0MyA4MCAxMjA5CjI0IDE3NTAgLTQ4IDQ3MSAtMTQ3IDk2NCAtMjgzIDE0MTEgLTU1IDE4MCAtMTMwIDM5OSAtMTQxIDQxMiAtNCA0IC03OTcKLTIwNTUgLTE3NjMgLTQ1NzZ6Ii8+CjxwYXRoIGQ9Ik0yOTI2IDEyMjc4IGMtMzY1IC0xMTM2IC00NTAgLTIzMzAgLTI1MCAtMzUxMyAzMDAgLTE3NzQgMTI2MiAtMzQwNAoyNjc5IC00NTM2IDE4MyAtMTQ3IDMzOSAtMjU5IDU1OSAtNDA0IDE4OCAtMTI0IDQ5NiAtMzA5IDUwMyAtMzAxIDUgNSAtMzQyMQo4OTI2IC0zNDI4IDg5MjYgLTQgMCAtMzIgLTc4IC02MyAtMTcyeiIvPgo8cGF0aCBkPSJNODk2OCA1NDg2IGMtOTQ0IC0yNDQ3IC05NTggLTI0ODQgLTk1OCAtMjU1MyAwIC02NSAyIC03MSAyMyAtNzcKNDU3IC0xMjggOTcyIC0yMTMgMTQ5MiAtMjQ2IDIwMyAtMTMgNzM0IC0xMyA5MzAgMCAzMTIgMjEgNjMzIDYxIDkyNiAxMTUgMTU3CjI4IDQ1MyA5NSA0NjkgMTA1IDEwIDYgMTAgMjcgMCA5NiAtMTEgODAgLTExMCAzNDEgLTk1NSAyNTM0IC01MTggMTM0NSAtOTQ5CjI0NjAgLTk1NiAyNDc3IC0xNCAzMiAtMzEgLTExIC05NzEgLTI0NTF6Ii8+CjwvZz4KPC9zdmc+Cg==';
            let dec = atob(contentresponse.data.content);
            console.log(dec)

            document.getElementById('svgdiv').innerHTML = dec;

            // TODO: display extruded SVG with Three.js

        } else {
            // TODO: show user an error message!
            console.log("There was an error retrieving the image data");
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

    initializeThreejs() {

    }


    updateLayout() {
        // placeholder
    }

    errorHandler(error) {
        window.console.log(error);
    }

}

export default Logeo