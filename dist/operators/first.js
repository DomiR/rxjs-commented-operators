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
function first(predicate, defaultValue) {
    return function (source) {
        return new rxjs_1.Observable(function (observer) {
            var sourceSubscription = source.subscribe(function (value) {
                utils_1.logValue('source value: ', value);
                observer.next(value);
                observer.complete();
            }, function (err) {
                utils_1.logValue('source err: ', err);
                observer.error(err);
            }, function () {
                utils_1.logValue('source complete');
                observer.complete();
            });
            // return subscription, which will unsubscribe from inner observable
            return new rxjs_1.Subscription(function () {
                sourceSubscription.unsubscribe();
            });
        });
    };
}
exports.first = first;
rxjs_1.interval(500)
    .pipe(first())
    .subscribe(function (v) {
    utils_1.logValue('value: ', v);
});
//# sourceMappingURL=first.js.map