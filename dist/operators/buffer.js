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
function buffer(closingNotifier) {
    return function (source) {
        return new rxjs_1.Observable(function (observer) {
            var buffer = [];
            var sourceSubscription = source.subscribe(function (value) {
                utils_1.logValue('source value: ', value);
                buffer.push(value);
            }, function (err) {
                utils_1.logValue('source err: ', err);
                observer.error(err);
            }, function () {
                utils_1.logValue('source complete');
                observer.complete();
            });
            var closingNotifierSubscription = closingNotifier.subscribe(function (value) {
                utils_1.logValue('closingNotifier: ', value);
                observer.next(buffer);
            }, function (err) {
                utils_1.logValue('closingNotifier err: ', err);
            }, function () {
                utils_1.logValue('closingNotifier complete');
                observer.complete();
            });
            // return subscription, which will unsubscribe from inner observable
            return new rxjs_1.Subscription(function () {
                sourceSubscription.unsubscribe();
                closingNotifierSubscription.unsubscribe();
            });
        });
    };
}
exports.buffer = buffer;
rxjs_1.interval(500)
    .pipe(buffer(rxjs_1.timer(500)))
    .subscribe(function (v) {
    utils_1.logValue('value: ', v);
});
//# sourceMappingURL=buffer.js.map