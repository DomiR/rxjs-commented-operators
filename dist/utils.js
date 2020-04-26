"use strict";
/**
 * utils
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */
Object.defineProperty(exports, "__esModule", { value: true });
function logValue() {
    var value = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        value[_i] = arguments[_i];
    }
    console.log.apply(console, value);
}
exports.logValue = logValue;
function logError() {
    var value = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        value[_i] = arguments[_i];
    }
    console.log.apply(console, value);
}
exports.logError = logError;
function logComplete() {
    var value = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        value[_i] = arguments[_i];
    }
    console.log.apply(console, value);
}
exports.logComplete = logComplete;
//# sourceMappingURL=utils.js.map