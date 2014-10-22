var _ = require("lodash");
var fs = require("fs");
var path = require("path");
var finder = require("fs-finder");
var config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json')));

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

function _filterExtension(stat, filePath) {
    var ext = _.last(filePath.split("."));

    ext = ext.toLowerCase();

    if (_.contains(config.moviesExtensions, ext)) {
        return true;
    } else {
        return false;
    }
}

function _rename() {
    finder
        .from(config.movieFolder)
        .filter(_filterExtension)
        .findFiles(function(files) {

            _.each(files, function(source) {

                //Keep file extension
                var ext = _.last(source.split("."));


                var cleaned = _cleanFileName(source)

                //var folder = _.initial(source.split("\\")).join("\\");





                var folder = _.initial(source.split("\\"));

                folder.push(cleaned + "." + ext);
                folder = folder.join("\\");

                console.log("target: " + folder);

                //var target = _cleanFileName(folder) + '.' + ext;

                //console.log("new name " + source);

                /*fs.rename(source, target, function(error, data) {
                                if (error) {
                                    console.log(error);
                                }
                            })*/


            })

        });
}



_rename();
