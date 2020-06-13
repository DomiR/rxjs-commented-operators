/**
 * Debounce operator
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
import { debounce as debounceOriginal } from 'rxjs/operators';

export function debounce<T>(durationSelector: (value: T) => Observable<any>) {
	return (source: Observable<T>) =>
		new Observable<T>(observer => {
			let debouncedValue: T;
			let durationSubscription: Subscription;
			let shouldComplete = false;

			// We subscribe to the source observable as we usuually do.
			// As the operator has a predicate argument we apply it
			// making it act like a filter. The actual implementation calls uses
			// the filter operator here.
			const sourceSubscription = source.subscribe(
				value => {
					console.debug('source with: ', value);
					debouncedValue = value;
					if (durationSubscription != null) {
						durationSubscription.unsubscribe();
					}
					const durationObservable = durationSelector(value);
					durationSubscription = durationObservable.subscribe(
						v => {
							observer.next(debouncedValue);
							debouncedValue = null;
							durationSubscription.unsubscribe();
							durationSubscription = null;
						},
						err => {},
						() => {
							// observer.next(debouncedValue);
							debouncedValue = null;
							durationSubscription = null;
							if (shouldComplete) {
								observer.complete();
							}
						}
					);
				},
				err => {
					logValue('source err: ', err);
					observer.error(err);
				},
				() => {
					logValue('source complete');

					// As soon as our source closes we
					// next the current count value.
					if (durationSubscription) {
						shouldComplete = true;
					} else {
						observer.complete();
					}
				}
			);

			// We return the subscription, which will unsubscribe from
			// inner observable in case the outer subscriber decides to
			// unsubscribe.
			return new Subscription(() => {
				sourceSubscription.unsubscribe();
				durationSubscription?.unsubscribe();
			});
		});
}

interval(500)
	.pipe(
		take(5),
		debounceOriginal(v => {
			console.debug('debounce', 1000);
			return timer(1000);
		})
	)
	.subscribe(v => {
		logValue('value: ', v);
	});
