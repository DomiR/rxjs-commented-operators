/**
 * map operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval } from 'rxjs';
import { map } from 'rxjs/operators';
import { logValue } from '../utils';

export function combineAll<T, R>(project?: (...values: Array<any>) => R) {
	return (source: Observable<T>) =>
		new Observable<any>(observer => {
			const combinedSubscription = new Subscription();
			const innerObservables = [];
			const innerObservablesLastValues = [];
			const sourceSubscription = source.subscribe(
				value => {
					logValue('source value: ', value);
					innerObservables.push(value);
				},
				err => {
					logValue('source err: ', err);
					observer.error(err);
				},
				() => {
					logValue('source complete');
					let active = innerObservables.length;

					// If no inner observable was emitted, we complete instantly.
					if (active === 0) {
						return observer.complete();
					}

					let NONE = {};
					let someInnerObservableDidNotRespondYet = true;
					for (let i = 0; i < innerObservables.length; i++) {
						const innerObservable = innerObservables[i];
						innerObservablesLastValues[i] = NONE;
						// Here we only consider inner observables, but rxjs will also handle all sorts of
						// values like arrays, promises and the the like.
						const innerSubscription = innerObservable.subscribe(
							value => {
								innerObservablesLastValues[i] = value;

								// We need to check here if some inner observable did not emit
								// any values yet, as the combine latest operation only
								// runs if all observables have at least one value emitted.
								if (someInnerObservableDidNotRespondYet) {
									someInnerObservableDidNotRespondYet = innerObservablesLastValues.some(
										v => v === NONE
									);
									return;
								}

								if (project != null) {
									const result = project(...innerObservablesLastValues);
									observer.next(result);
								} else {
									observer.next(innerObservablesLastValues);
								}
							},
							err => {
								observer.error(err);
							},
							() => {
								// We need to count closing for all
								// an close outer if all inner are closed as well.
								active -= 1;
								if (active === 0) {
									observer.complete();
								}
							}
						);
						combinedSubscription.add(innerSubscription);
					}
				}
			);

			combinedSubscription.add(sourceSubscription);
			return combinedSubscription;
		});
}
