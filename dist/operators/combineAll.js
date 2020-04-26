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
function combineAll(project) {
    return function (source) {
        return new rxjs_1.Observable(function (observer) {
            var combinedSubscription = new rxjs_1.Subscription();
            var innerObservables = [];
            var innerObservablesLastValues = [];
            var sourceSubscription = source.subscribe(function (value) {
                utils_1.logValue('source value: ', value);
                innerObservables.push(value);
            }, function (err) {
                utils_1.logValue('source err: ', err);
                observer.error(err);
            }, function () {
                utils_1.logValue('source complete');
                var active = innerObservables.length;
                // If no inner observable was emitted, we complete instantly.
                if (active === 0) {
                    return observer.complete();
                }
                var NONE = {};
                var someInnerObservableDidNotRespondYet = true;
                var _loop_1 = function (i) {
                    var innerObservable = innerObservables[i];
                    innerObservablesLastValues[i] = NONE;
                    // Here we only consider inner observables, but rxjs will also handle all sorts of
                    // values like arrays, promises and the the like.
                    var innerSubscription = innerObservable.subscribe(function (value) {
                        innerObservablesLastValues[i] = value;
                        // We need to check here if some inner observable did not emit
                        // any values yet, as the combine latest operation only
                        // runs if all observables have at least one value emitted.
                        if (someInnerObservableDidNotRespondYet) {
                            someInnerObservableDidNotRespondYet = innerObservablesLastValues.some(function (v) { return v === NONE; });
                            return;
                        }
                        if (project != null) {
                            var result = project.apply(void 0, innerObservablesLastValues);
                            observer.next(result);
                        }
                        else {
                            observer.next(innerObservablesLastValues);
                        }
                    }, function (err) {
                        observer.error(err);
                    }, function () {
                        // We need to count closing for all
                        // an close outer if all inner are closed as well.
                        active -= 1;
                        if (active === 0) {
                            observer.complete();
                        }
                    });
                    combinedSubscription.add(innerSubscription);
                };
                for (var i = 0; i < innerObservables.length; i++) {
                    _loop_1(i);
                }
            });
            combinedSubscription.add(sourceSubscription);
            return combinedSubscription;
        });
    };
}
exports.combineAll = combineAll;
//# sourceMappingURL=combineAll.js.map