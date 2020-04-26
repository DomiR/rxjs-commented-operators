"use strict";
/**
 * map operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */
Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("rxjs");
var utils_1 = require("../utils");
function concatAll() {
    return function (source) {
        return new rxjs_1.Observable(function (observer) {
            var combinedSubscription = new rxjs_1.Subscription();
            var innerObservables = [];
            var activeSubscription = null;
            function subscribeToNextInner() {
                if (innerObservables.length > 0 &&
                    (activeSubscription == null || activeSubscription.closed)) {
                    var nextInnerObservable = innerObservables.shift();
                    activeSubscription = nextInnerObservable.subscribe(function (value) {
                        observer.next(value);
                    }, function (err) {
                        observer.error(err);
                    }, function () {
                        activeSubscription = null;
                        subscribeToNextInner();
                    });
                }
            }
            var sourceSubscription = source.subscribe(function (value) {
                utils_1.logValue('source value: ', value);
                innerObservables.push(value);
                subscribeToNextInner();
            }, function (err) {
                utils_1.logValue('source err: ', err);
                observer.error(err);
            }, function () {
                utils_1.logValue('source complete');
                if (activeSubscription == null && innerObservables.length == 0) {
                    observer.complete();
                }
            });
            combinedSubscription.add(sourceSubscription).add(function () {
                var _a;
                (_a = activeSubscription) === null || _a === void 0 ? void 0 : _a.unsubscribe();
            });
            return combinedSubscription;
        });
    };
}
exports.concatAll = concatAll;
rxjs_1.of(rxjs_1.of('a', 'b', 'c'), rxjs_1.of('a', 'b', 'c'), rxjs_1.of('a', 'b', 'c'))
    .pipe(concatAll())
    .subscribe(function (x) { return console.log(x); });
//# sourceMappingURL=concatAll.js.map