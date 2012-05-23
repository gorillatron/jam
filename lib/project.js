var utils = require('./utils'),
    path = require('path'),
    semver = require('semver'),
    async = require('async'),
    mkdirp = require('mkdirp'),
    fs = require('fs');


exports.load = async.memoize(function (package_dir, callback) {
    var settings_file = path.resolve(package_dir, 'jam.json');
    path.exists(settings_file, function (exists) {
        if (exists) {
            utils.readJSON(settings_file, function (err, settings) {
                if (err) {
                    return callback(err);
                }
                try {
                    exports.validate(settings, settings_file);
                }
                catch (e) {
                    return callback(e);
                }
                return callback(null, settings);
            });
        }
        else {
            exports.createMeta(callback);
        }
    });
});

exports.validate = function (settings, filename) {
    // nothing to validate yet
};

exports.createMeta = function (callback) {
    utils.getJamVersion(function (err, version) {
        if (err) {
            return callback(err);
        }
        callback(null, {
            jam_version: version,
            dependencies: {}
        });
    });
};

exports.writeMeta = function (package_dir, data, callback) {
    // TODO: add _rev field to meta file and check if changed since last read
    // before writing
    var filename = path.resolve(package_dir, 'jam.json');
    try {
        var str = JSON.stringify(data, null, 4);
    }
    catch (e) {
        return callback(e);
    }
    mkdirp(package_dir, function (err) {
        if (err) {
            return callback(err);
        }
        logger.info('Updating', path.relative(process.cwd(), filename));
        fs.writeFile(filename, str, function (err) {
            // TODO: after adding _rev field, return updated _rev value in data here
            return callback(err, data);
        });
    });
};