/**
 * Max operator
 *
 * @see
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval } from 'rxjs';
import { logValue } from '../utils';
import { max as maxOriginal } from 'rxjs/operators';

export function max<T>(comparer?: (a: T, b: T) => number) {
	return (source: Observable<T>) =>
		new Observable<T>(observer => {
			let maxValue = null;

			// We subscribe to the source observable as we usuually do.
			// For every value we get we use either our comparer function
			// if available or < comparison to save the largest value
			// for later.
			const sourceSubscription = source.subscribe(
				value => {
					logValue('source value: ', value);
					try {
						maxValue =
							maxValue == null
								? value
								: typeof comparer === 'function'
								? comparer(maxValue, value) > 0
									? maxValue
									: value
								: maxValue > value
								? maxValue
								: value;
					} catch (err) {
						// If the predicate function throws an error,
						// we unsubscribe from the source and pass the
						// error down the observer chain.
						sourceSubscription.unsubscribe();
						observer.error(err);
					}
				},
				err => {
					logValue('source err: ', err);
					observer.error(err);
				},
				() => {
					logValue('source complete');

					// As soon as our source dries up (aka closes) we
					// check if we have any value and emit it.
					if (maxValue != null) {
						observer.next(maxValue);
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
	.pipe(max())
	.subscribe(v => {
		logValue('value: ', v);
	});
