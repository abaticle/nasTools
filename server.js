var _ = require("lodash");
var opensubtitles = require("opensubtitles-client");
var fs = require("fs");
var path = require("path");
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var finder = require("fs-finder");
var server = require('http').Server(app);
var io = require('socket.io')(server);
var cors = require('cors')

var config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json')));
var _token = "";
var socket;


init();

/*
 *   Check config
 */
function init() {
    var check = true;

    if (!fs.existsSync(config.origin)) {
        console.error("Error reading", config.origin);
        check = false;
    }
    if (!fs.existsSync(config.target)) {
        console.error("Error reading", config.target);
        check = false;
    }

    if (check) {
        console.log("All is good !");
    } else {
        console.error("Config error !");
    }

    app.use('/', express.static(path.join(__dirname, 'client')));
    app.use(bodyParser());
    app.use(cors());
    server.listen(config.port);
    console.log("Listening on port", config.port);

    io.on('connection', function(socketTmp) {
        socket = socketTmp;

        console.log("Socket.io client connected");
    });
}


/*
 *   Copy file from origin to target
 */
function _copyFile(path, withSocket, callback) {
    var callbackCalled = false;
    var targetPath = config.target + "\\" + _.last(path.split("\\"));
    var reader = fs.createReadStream(path);
    var writer = fs.createWriteStream(targetPath);

    var percent = 0;
    var tempPercent = 0;
    var copied = 0;
    var fileSize = fs.statSync(path).size;

    console.log("Copy file " + path);

    reader.on("error", function(err) {
        done(err);
    });

    writer.on("error", function(err) {
        done(err);
    });

    writer.on("close", function(ex) {
        done();
    });

    reader.pipe(writer);

    if (withSocket) {
        reader.on('data', function(chunk) {

            copied += parseInt(chunk.length);
            percent = parseInt((copied * 100) / fileSize);

            if (tempPercent != percent) {
                tempPercent = percent;
                //console.log(tempPercent, "%");

                if (tempPercent % 2 === 0)
                    socket.emit("copy", {
                        percent: tempPercent,
                        path: path
                    });
            }
        });
    }



    function done(err) {

        if (!callbackCalled) {
            console.log("File copied");

            callback(err);
            callbackCalled = true;
        }
    }
}


function _getSubtitleFromPath(path) {
    var check = false;
    var targetPath = "";
    var targetSubtitle = "";

    _.each(config.subtitlesExtensions, function(extension) {

        targetPath = path.substr(0, path.lastIndexOf('.'));
        targetPath += "." + extension;

        if (fs.existsSync(targetPath)) {
            targetSubtitle = targetPath;
        }

    });

    return targetSubtitle;
}

/*
 *   Check if file has a subtitles having same name
 *   and using config.subtitlesExtensions
 */
function _hasSubtitles(path) {
    var check = false;
    var targetPath = "";

    //Check on target 
    path = [
        config.target,
        _.last(path.split("\\"))
    ].join("\\");

    _.each(config.subtitlesExtensions, function(extension) {

        targetPath = path.substr(0, path.lastIndexOf('.'));
        targetPath += "." + extension;

        if (fs.existsSync(targetPath)) {
            check = true;
        }
    });

    return check;
}


/*
 *   Filter for fs-finder using allowed config.moviesExtensions
 */
function _filterExtension(stat, filePath) {
    var ext = _.last(filePath.split("."));

    ext = ext.toLowerCase();

    if (_.contains(config.moviesExtensions, ext)) {
        return true;
    } else {
        return false;
    }
}

/*
 *   Return a clean file name using it's path
 */
function _cleanFileName(path) {

    var fileName = _.last(path.split("\\"));

    //remove extension
    fileName = fileName.substr(0, fileName.lastIndexOf('.'));

    //Remove "." or "-"
    fileName = fileName.split(".").join(" ").split("-").join(" ");

    //Remove useless words
    fileName = fileName.split(" ");

    _.each(config.wordsToAvoid, function(word) {
        fileName = _.without(fileName, word);
    });

    return fileName.join(" ");
}

/*
 *   Check if copied to the target (not recursive)
 */
function _isCopied(path) {

    var fileName = _.last(path.split("\\"));
    var targetPath = config.target + "\\" + fileName;

    return fs.existsSync(targetPath);
}


function _downloadFile(results, file, callback) {

    //Get only by Hash and srt format
    var newResults = results;

    newResults = _.where(results, {
        "MatchedBy": "moviehash",
        "SubFormat": "srt"
    });

    //Get most downloaded
    if (newResults.length === 0) {
        newResults = results;
    } else {
        newResults.push(_.max(newResults, "SubDownloadsCnt"));
    }

    console.log("dl sub : " + file);

    opensubtitles.downloader.download(newResults, 1, file, callback);
}


app.get("/getSubtitle", function(req, res) {
    var filePath = req.query.path;

    //If copied, get subtitle for target path
    if (_isCopied(filePath)) {
        filePath = [
            config.target,
            _.last(filePath.split("\\"))
        ].join("\\");
    }

    opensubtitles
        .api
        .login()
        .done(function(token) {

            console.log("Connected to opensubtitles");

            //Save token
            _token = token;

            opensubtitles
                .api
                .searchForFile(_token, config.langFirst, filePath)
                .done(function(results) {

                    if (results.length === 0) {

                        opensubtitles
                            .api
                            .searchForFile(_token, config.langSecond, filePath)
                            .done(function(results) {
                                console.log(results);
                                if (results.length === 0) {
                                    res.send({
                                        type: "error"
                                    });
                                } else {
                                    _downloadFile(results, filePath, function(data) {
                                        console.log(data);
                                        res.send({
                                            type: "success"
                                        });
                                    });
                                }

                            });

                    } else {
                        _downloadFile(results, filePath, function(data) {
                            console.log(results);
                            console.log(data);
                            res.send({
                                type: "success"
                            });
                        });
                    }
                });
        });

});

app.get("/copyMovie", function(req, res) {

    var filePath = req.query.path;
    var subtitleTarget = _getSubtitleFromPath(filePath);

    //Copy subtitle
    if (subtitleTarget !== "") {
        _copyFile(_getSubtitleFromPath(filePath), false, function(error) {});
    }


    //And copy file
    _copyFile(filePath, true, function(error) {


        if (error === undefined) {
            res.send({
                "error": true,
                "message": "Fichier copié avec succès"
            });
        } else {
            res.send({
                "error": false,
                "message": "Erreur durant le copie"
            });
        }
    })

});

app.get("/getMovies", function(req, res) {

    var date = req.query.date;
    var hoursFrom;
    var hoursTo;

    if (date === undefined || isNaN(date)) {
        date = 0;
    } else {
        date = parseInt(date);
    }

    hoursFrom = date * 24;
    hoursTo = (date + 6) * 24;

    finder
        .from(config.origin)
        .date(">", {
            hours: hoursTo
        })
        .date("<", {
            hours: hoursFrom
        })
        .size(">=", config.minSize * 8 * 1024)
        .filter(_filterExtension)
        .findFiles(function(files) {
            console.log(files);

            var filesReturn = [];
            var fileReturn = {};

            _.each(files, function(file) {
                fileReturn = {
                    "path": file,
                    "name": _cleanFileName(file),
                    "isCopied": _isCopied(file),
                    "hasSubtitles": _hasSubtitles(file)
                };

                if (fileReturn.name !== "") {
                    filesReturn.push(fileReturn);
                }
            });

            res.send(filesReturn);
        });
});
