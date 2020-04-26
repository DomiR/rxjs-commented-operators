"use strict";
/**
 * map operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */
Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("rxjs");
function map(cb) {
    return function (source) {
        return new rxjs_1.Observable(function (observer) {
            var subscription = source.subscribe(function (value) {
                var mappedValue = cb(value);
                observer.next(mappedValue);
            }, function (err) {
                observer.error(err);
            }, function () {
                observer.complete();
            });
            // return subscription, which will
            return new rxjs_1.Subscription(function () {
                subscription.unsubscribe();
            });
        });
    };
}
exports.map = map;
rxjs_1.of(1, 2, 3)
    .pipe(map(function (v) { return v + 1; }))
    .subscribe(function (v) {
    console.log('value: ', v);
});
//# sourceMappingURL=map.js.map