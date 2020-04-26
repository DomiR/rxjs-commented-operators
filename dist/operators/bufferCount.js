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
function bufferCount(bufferSize, startBufferEvery) {
    if (startBufferEvery === void 0) { startBufferEvery = null; }
    return function (source) {
        return new rxjs_1.Observable(function (observer) {
            var bufferList = [];
            var buffer = [];
            var count = 0;
            var sourceSubscription = source.subscribe(function (value) {
                utils_1.logValue('source value: ', value);
                // The original operator handles both cases
                // in a very otimized manner, but we do
                // not have to do so.
                if (startBufferEvery != null) {
                    count += 1;
                    // If the start bufferEvery is set, we need to
                    // build up new a new buffer every time
                    // our count reaches that number by pushing
                    // an emtpy array to our buffer list.
                    if (count % startBufferEvery) {
                        bufferList.push([]);
                    }
                    // Then we go through all buffers in buffer list and
                    // check if they have bufferSize items already.
                    // If so, we emit that buffer and remove from this list.
                    for (var _i = 0, bufferList_1 = bufferList; _i < bufferList_1.length; _i++) {
                        var buffer_1 = bufferList_1[_i];
                        buffer_1.push(value);
                        if (buffer_1.length === bufferSize) {
                            observer.next(buffer_1);
                            bufferList.slice(bufferList.indexOf(buffer_1), 1);
                        }
                    }
                }
                else {
                    buffer.push(value);
                    if (buffer.length === bufferSize) {
                        observer.next(buffer);
                        buffer = [];
                    }
                }
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
exports.bufferCount = bufferCount;
rxjs_1.interval(500)
    .pipe(bufferCount(3, 2))
    .subscribe(function (v) {
    utils_1.logValue('value: ', v);
});
//# sourceMappingURL=bufferCount.js.map