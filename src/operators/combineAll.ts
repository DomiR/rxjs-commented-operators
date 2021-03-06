/**
 * Combine all operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval } from 'rxjs';

import { combineAll as combineAllOriginal } from 'rxjs/operators';

export function combineAll<T, R>(project?: (...values: Array<any>) => R) {
	return (source: Observable<T>) =>
		new Observable<any>(observer => {
			const combinedSubscription = new Subscription();
			const innerObservables = [];
			const innerObservablesLastValues = [];
			const sourceSubscription = source.subscribe(
				value => {
					console.log('source value: ', value);
					innerObservables.push(value);
				},
				err => {
					console.log('source err: ', err);
					observer.error(err);
				},
				() => {
					console.log('source complete');
					let active = innerObservables.length;

					// If no inner observable was emitted, we complete instantly.
					if (active === 0) {
						return observer.complete();
					}

					let NONE = {};
					let someInnerObservableDidNotRespondYet = true;
					for (let i = 0; i < innerObservables.length; i++) {
						innerObservablesLastValues[i] = NONE;
					}

					for (let i = 0; i < innerObservables.length; i++) {
						const innerObservable = innerObservables[i];
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
								}

								if (someInnerObservableDidNotRespondYet) {
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

of(of(1, 2, 3), of(4, 5, 6), of(7, 8, 9))
	.pipe(
		combineAll((a, b, c) => {
			return `${a}-${b}-${c}`;
		})
	)
	.subscribe(
		x => console.log(x),
		err => console.log(err)
	);
