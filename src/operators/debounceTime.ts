/**
 * Debounce time operator
 *
 * @see
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval } from 'rxjs';
import { logValue } from '../utils';
import { take } from 'rxjs/operators';
import { ObserveOnSubscriber } from 'rxjs/internal/operators/observeOn';
import { debounceTime as debounceTimeOriginal } from 'rxjs/operators';

export function debounceTime<T>(duration: number) {
	return (source: Observable<T>) =>
		new Observable<T>(observer => {
			let debouncedValue: T;
			let durationTimer: NodeJS.Timeout;

			// We subscribe to the source observable as we usuually do.
			// As the operator has a predicate argument we apply it
			// making it act like a filter. The actual implementation calls uses
			// the filter operator here.
			const sourceSubscription = source.subscribe(
				value => {
					debouncedValue = value;
					if (durationTimer == null) {
						console.debug('debounce with: ', value);
						durationTimer = setTimeout(() => {
							observer.next(debouncedValue);
							durationTimer = null;
						}, duration);
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
					observer.complete();
				}
			);

			// We return the subscription, which will unsubscribe from
			// inner observable in case the outer subscriber decides to
			// unsubscribe.
			return new Subscription(() => {
				sourceSubscription.unsubscribe();
				clearTimeout(durationTimer);
			});
		});
}

interval(500)
	.pipe(take(5), debounceTime(1000))
	.subscribe(v => {
		logValue('value: ', v);
	});
