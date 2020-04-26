"use strict";
/**
 * map operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */
Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var utils_1 = require("../utils");
function catchError(selector) {
    return function (source) {
        return new rxjs_1.Observable(function (observer) {
            var sourceSubscription;
            function subscribeToSource(innerSource) {
                sourceSubscription = innerSource.subscribe(function (value) {
                    // we pass through all values
                    utils_1.logValue('source value: ', value);
                    observer.next(value);
                }, function (err) {
                    var _a;
                    utils_1.logValue('source err: ', err);
                    try {
                        // We pass the err to the user, so he can build
                        // a replacement observable, which we need to re-
                        // subscribe to.
                        var result = selector(err, innerSource);
                        // Unsubscribe from current subscription to source.
                        // In case of synchronous source creation like of
                        // this might not be set yet.
                        (_a = sourceSubscription) === null || _a === void 0 ? void 0 : _a.unsubscribe();
                        // And then we re-subscribe to the new result from the selector.
                        subscribeToSource(result);
                    }
                    catch (nextErr) {
                        observer.error(nextErr);
                    }
                }, function () {
                    utils_1.logValue('source complete');
                    observer.complete();
                });
            }
            // initially subscribe to the original source
            subscribeToSource(source);
            // return subscription, which will unsubscribe from inner observable
            return new rxjs_1.Subscription(function () {
                sourceSubscription.unsubscribe();
            });
        });
    };
}
exports.catchError = catchError;
rxjs_1.of(1, 2, 3, 4, 5)
    .pipe(operators_1.map(function (n) {
    if (n === 4) {
        throw 'four!';
    }
    return n;
}), catchError(function (err) {
    return rxjs_1.of(6, 7, 8);
}))
    .subscribe(function (x) { return console.log(x); }, function (err) { return console.log(err); });
//# sourceMappingURL=catchError.js.map