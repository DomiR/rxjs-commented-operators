/**
 * last operator
 *
 * @see
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval } from 'rxjs';
import { logValue } from '../utils';
import { take } from 'rxjs/operators';

export function last<T>(
	predicate?: (value: T, index: number, source: Observable<T>) => boolean,
	defaultValue?: T
) {
	return (source: Observable<T>) =>
		new Observable<T>(observer => {
			let lastValue = null;
			let index = 0;

			// We subscribe to the source observable as we usuually do.
			// As the operator has a predicate argument we apply it
			// making it act like a filter. The actual implementation calls uses
			// the filter operator here.
			const sourceSubscription = source.subscribe(
				value => {
					logValue('source value: ', value);
					try {
						// If we do not pass a filter predicate we
						// replace the lastValue wich each new
						// incoming value, otherwise only if the
						// predicate function returns true.
						if (predicate == null) {
							lastValue = value;
						} else if (predicate(value, (index += 1), source)) {
							lastValue = value;
						}
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
					// check if we have any value (that passed the filter,
					// when passing a predicate function). We can also
					// pass a default value, that gets nexted in this case.
					if (lastValue == null && defaultValue == null) {
						observer.error(new Error('no last value'));
					} else if (lastValue == null && defaultValue != null) {
						observer.next(defaultValue);
					} else {
						observer.next(lastValue);
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

interval(500)
	.pipe(take(5), last())
	.subscribe(v => {
		logValue('value: ', v);
	});
