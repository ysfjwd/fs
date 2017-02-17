"use strict";
const fs_1 = require("fs");
const Q = require("q");
const validate_1 = require("./utils/validate");
const supportedReturnAs = ['utf8', 'buffer', 'json', 'jsonWithDates'];
function validateInput(methodName, path, returnAs) {
    const methodSignature = methodName + '(path, returnAs)';
    validate_1.validateArgument(methodSignature, 'path', path, ['string']);
    validate_1.validateArgument(methodSignature, 'returnAs', returnAs, ['string', 'undefined']);
    if (returnAs && supportedReturnAs.indexOf(returnAs) === -1) {
        throw new Error('Argument "returnAs" passed to ' + methodSignature
            + ' must have one of values: ' + supportedReturnAs.join(', '));
    }
}
exports.validateInput = validateInput;
;
// Matches strings generated by Date.toJSON()
// which is called to serialize date to JSON.
const jsonDateParser = function (key, value) {
    var reISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/;
    if (typeof value === 'string') {
        if (reISO.exec(value)) {
            return new Date(value);
        }
    }
    return value;
};
function makeNicerJsonParsingError(path, err) {
    const nicerError = new Error('JSON parsing failed while reading '
        + path + ' [' + err + ']');
    nicerError.originalError = err;
    return nicerError;
}
;
// ---------------------------------------------------------
// SYNC
// ---------------------------------------------------------
function sync(path, returnAs) {
    const retAs = returnAs || 'utf8';
    let data;
    let encoding = 'utf8';
    if (retAs === 'buffer') {
        encoding = null;
    }
    try {
        data = fs_1.readFileSync(path, { encoding: encoding });
    }
    catch (err) {
        if (err.code === 'ENOENT') {
            // If file doesn't exist return undefined instead of throwing.
            return undefined;
        }
        // Otherwise rethrow the error
        throw err;
    }
    try {
        if (retAs === 'json') {
            data = JSON.parse(data);
        }
        else if (retAs === 'jsonWithDates') {
            data = JSON.parse(data, jsonDateParser);
        }
    }
    catch (err) {
        throw makeNicerJsonParsingError(path, err);
    }
    return data;
}
exports.sync = sync;
;
// ---------------------------------------------------------
// ASYNC
// ---------------------------------------------------------
const promisedReadFile = Q.denodeify(fs_1.readFile);
function async(path, returnAs) {
    return new Promise((resolve, reject) => {
        const retAs = returnAs || 'utf8';
        let encoding = 'utf8';
        if (retAs === 'buffer') {
            encoding = null;
        }
        promisedReadFile(path, { encoding: encoding })
            .then(data => {
            // Make final parsing of the data before returning.
            try {
                if (retAs === 'json') {
                    resolve(JSON.parse(data));
                }
                else if (retAs === 'jsonWithDates') {
                    resolve(JSON.parse(data, jsonDateParser));
                }
                else {
                    resolve(data);
                }
            }
            catch (err) {
                reject(makeNicerJsonParsingError(path, err));
            }
        })
            .catch(function (err) {
            if (err.code === 'ENOENT') {
                // If file doesn't exist return undefined instead of throwing.
                resolve(undefined);
            }
            else {
                // Otherwise throw
                reject(err);
            }
        });
    });
}
exports.async = async;
;
//# sourceMappingURL=read.js.map