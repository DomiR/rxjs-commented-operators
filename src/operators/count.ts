/**
 * Count operator
 *
 * @see
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval } from 'rxjs';
import { logValue } from '../utils';
import { take } from 'rxjs/operators';

export function last<T>(predicate?: (value: T, index: number, source: Observable<T>) => boolean) {
	return (source: Observable<T>) =>
		new Observable<number>(observer => {
			let count = 0;
			let index = 0;

			// We subscribe to the source observable as we usuually do.
			// As the operator has a predicate argument we apply it
			// making it act like a filter. The actual implementation calls uses
			// the filter operator here.
			const sourceSubscription = source.subscribe(
				value => {
					logValue('source value: ', value);
					try {
						// We increment the counter for every
						// value. If a predicate function is
						// available, it needs to pass that first.
						if (typeof predicate != 'function' || predicate(value, (index += 1), source)) {
							count += 1;
						}
					} catch (err) {
						// If the predicate function throws an error,
						// we unsubscribe from the inner source and pass the
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

					// As soon as our source closes we
					// next the current count value.
					observer.next(count);
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

interval(500)
	.pipe(take(5), last())
	.subscribe(v => {
		logValue('value: ', v);
	});
