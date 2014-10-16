var _ = require("lodash");
var opensubtitles = require("opensubtitles-client");
var fs = require("fs");
var path = require("path");
var express = require("express");
var bodyParser = require("body-parser");
var finder = require("fs-finder");

var config = JSON.parse(fs.readFileSync("config.json"));
var app = express();
var io = require('socket.io')(app);
var _token = "";



app.use('/', express.static(path.join(__dirname, 'client')));
app.use(bodyParser());
app.listen(config.port);

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

    console.log("Listening on port", config.port);
}


/*
 *   Copy file from origin to target
 */
function _copyFile(path, callback) {
    var callbackCalled = false;
    var targetPath = config.target + "\\" + _.last(path.split("\\"));
    var reader = fs.createReadStream(path);
    var writer = fs.createWriteStream(targetPath);

    var percent = 0;
    var tempPercent = 0;
    var copied = 0;
    var fileSize = fs.statSync(path).size;

    reader.on("error", function (err) {
        done(err);
    });

    writer.on("error", function (err) {
        done(err);
    });

    writer.on("close", function (ex) {
        done();
    });

    reader.pipe(writer);

    reader.on('data', function (chunk) {
        //console.log(chunk);
        copied += parseInt(chunk.length);

        percent = parseInt((copied * 100) / fileSize);

        if (tempPercent != percent) {
            tempPercent = percent;
            console.log(tempPercent, "%");
        }
    });

    function done(err) {
        if (!callbackCalled) {
            callback(err);
            callbackCalled = true;
        }
    }
}

/*
 *   Check if file has a subtitles having same name
 *   and using config.subtitlesExtensions
 */
function _hasSubtitles(path) {
    var check = false;
    var targetPath = "";

    _.each(config.subtitlesExtensions, function (extension) {

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

    _.each(config.wordsToAvoid, function (word) {
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

app.get('/copyMovie', function (req, res) {

    var filePath = req.query.path;

    _copyFile(filePath, function (error) {
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

app.get('/getMovies.json', function (req, res) {

    var date = req.query.date;
    var hoursFrom;
    var hoursTo;

    if (date === undefined || isNaN(date)) {
        date = 0;
    } else {
        date = parseInt(date);
    }

    hoursFrom = date * 24;
    hoursTo = (date + 1) * 24;

    finder
        .from(config.origin)
    /*.date(">", {
            hours: hoursTo
        })
        .date("<", {
            hours: hoursFrom
        })*/
    .size(">=", config.minSize * 8 * 1024)
        .filter(_filterExtension)
        .findFiles(function (files) {
            console.log(files);

            var filesReturn = [];
            var fileReturn = {};

            _.each(files, function (file) {
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