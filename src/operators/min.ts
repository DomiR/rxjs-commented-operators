/**
 * Min operator
 *
 * @see
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval } from 'rxjs';

import { take } from 'rxjs/operators';
import { min as minOriginal } from 'rxjs/operators';

export function min<T>(comparer?: (a: T, b: T) => number) {
	return (source: Observable<T>) =>
		new Observable<T>(observer => {
			let minValue = null;

			// We subscribe to the source observable as we usuually do.
			// For every value we get we use either our comparer function
			// if available or > comparison to save the smallest value
			// for later.
			const sourceSubscription = source.subscribe(
				value => {
					console.log('source value: ', value);
					try {
						minValue =
							minValue == null
								? value
								: typeof comparer === 'function'
								? comparer(minValue, value) > 0
									? value
									: minValue
								: minValue > value
								? value
								: minValue;
					} catch (err) {
						// If the predicate function throws an error,
						// we unsubscribe from the source and pass the
						// error down the observer chain.
						sourceSubscription.unsubscribe();
						observer.error(err);
					}
				},
				err => {
					console.log('source err: ', err);
					observer.error(err);
				},
				() => {
					console.log('source complete');

					// As soon as our source dries up (aka closes) we
					// check if we have any value and emit it.
					if (minValue != null) {
						observer.next(minValue);
					}
					observer.complete();
				}
			);

			// We return the subscription, which will unsubscribe from
			// inner observable in case the outer subscriber decides to
			// unsubscribe.
			return new Subscription(() => {
				sourceSubscription.unsubscribe();
			});
		});
}

of(1, 2, 3)
	.pipe(min())
	.subscribe(v => {
		console.log('value: ', v);
	});
