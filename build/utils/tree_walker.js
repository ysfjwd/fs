"use strict";
/* eslint no-underscore-dangle:0 */
const stream_1 = require("stream");
const pathUtil = require("path");
const inspect_1 = require("../inspect");
const list_1 = require("../list");
// ---------------------------------------------------------
// SYNC
// ---------------------------------------------------------
function sync(path, options, callback, currentLevel) {
    const item = inspect_1.sync(path, options.inspectOptions);
    if (options.maxLevelsDeep === undefined) {
        options.maxLevelsDeep = Infinity;
    }
    if (currentLevel === undefined) {
        currentLevel = 0;
    }
    callback(path, item);
    if (item && item.type === 'dir' && currentLevel < options.maxLevelsDeep) {
        list_1.sync(path).forEach(function (child) {
            sync(path + pathUtil.sep + child, options, callback, currentLevel + 1);
        });
    }
}
exports.sync = sync;
;
// ---------------------------------------------------------
// STREAM
// ---------------------------------------------------------
function stream(path, options) {
    var rs = new stream_1.Readable({ objectMode: true });
    let nextTreeNode = {
        path: path,
        parent: undefined,
        level: 0
    };
    let running = false;
    let readSome;
    const error = function (err) {
        rs.emit('error', err);
    };
    const findNextUnprocessedNode = function (node) {
        if (node.nextSibling) {
            return node.nextSibling;
        }
        else if (node.parent) {
            return findNextUnprocessedNode(node.parent);
        }
        return undefined;
    };
    const pushAndContinueMaybe = function (data) {
        var theyWantMore = rs.push(data);
        running = false;
        if (!nextTreeNode) {
            // Previous was the last node. The job is done.
            rs.push(null);
        }
        else if (theyWantMore) {
            readSome();
        }
    };
    if (options.maxLevelsDeep === undefined) {
        options.maxLevelsDeep = Infinity;
    }
    readSome = function () {
        let theNode = nextTreeNode;
        running = true;
        inspect_1.async(theNode.path, options.inspectOptions)
            .then(function (inspected) {
            theNode.inspected = inspected;
            if (inspected && inspected.type === 'dir' && theNode.level < options.maxLevelsDeep) {
                list_1.async(theNode.path)
                    .then(function (childrenNames) {
                    let children = childrenNames.map(function (name) {
                        return {
                            name: name,
                            path: theNode.path + pathUtil.sep + name,
                            parent: theNode,
                            level: theNode.level + 1
                        };
                    });
                    children.forEach(function (child, index) {
                        child.nextSibling = children[index + 1];
                    });
                    nextTreeNode = children[0] || findNextUnprocessedNode(theNode);
                    pushAndContinueMaybe({ path: theNode.path, item: inspected });
                })
                    .catch(error);
            }
            else {
                nextTreeNode = findNextUnprocessedNode(theNode);
                pushAndContinueMaybe({ path: theNode.path, item: inspected });
            }
        })
            .catch(error);
    };
    rs['_read'] = function () {
        if (!running) {
            readSome();
        }
    };
    return rs;
}
exports.stream = stream;
//# sourceMappingURL=tree_walker.js.map