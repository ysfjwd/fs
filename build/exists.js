"use strict";
const fs = require("fs");
const validate_1 = require("./utils/validate");
function validateInput(methodName, path) {
    const methodSignature = methodName + '(path)';
    validate_1.argument(methodSignature, 'path', path, ['string']);
}
exports.validateInput = validateInput;
;
// ---------------------------------------------------------
// Sync
// ---------------------------------------------------------
function sync(path) {
    var stat;
    try {
        stat = fs.statSync(path);
        if (stat.isDirectory()) {
            return 'dir';
        }
        else if (stat.isFile()) {
            return 'file';
        }
        return 'other';
    }
    catch (err) {
        if (err.code !== 'ENOENT' && err.code !== 'ENOTDIR') {
            throw err;
        }
    }
    return false;
}
exports.sync = sync;
;
// ---------------------------------------------------------
// Async
// ---------------------------------------------------------
function async(path) {
    return new Promise((resolve, reject) => {
        fs.stat(path, function (err, stat) {
            if (err) {
                if (err.code === 'ENOENT' || err.code === 'ENOTDIR') {
                    resolve(false);
                }
                else {
                    reject(err);
                }
            }
            else if (stat.isDirectory()) {
                resolve('dir');
            }
            else if (stat.isFile()) {
                resolve('file');
            }
            else {
                resolve('other');
            }
        });
    });
}
exports.async = async;
;
//# sourceMappingURL=exists.js.map