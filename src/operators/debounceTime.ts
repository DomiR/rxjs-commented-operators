/**
 * Debounce time operator
 *
 * @see
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval } from 'rxjs';

import { take } from 'rxjs/operators';
import { debounceTime as debounceTimeOriginal } from 'rxjs/operators';

export function debounceTime<T>(duration: number) {
	return (source: Observable<T>) =>
		new Observable<T>(observer => {
			let durationTimer: NodeJS.Timeout;
			let shouldComplete = false;
			// We subscribe to the source observable as we usuually do.
			// As the operator has a predicate argument we apply it
			// making it act like a filter. The actual implementation calls uses
			// the filter operator here.
			const sourceSubscription = source.subscribe(
				value => {
					console.log('source value: ', value);
					if (durationTimer) {
						clearTimeout(durationTimer);
					}
					durationTimer = setTimeout(() => {
						observer.next(value);
						if (shouldComplete) {
							observer.complete();
						}
					}, duration);
				},
				err => {
					console.log('source err: ', err);
					observer.error(err);
				},
				() => {
					console.log('source complete');

					// As soon as our source closes we
					// next the current count value.
					if (durationTimer != null) {
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
				clearTimeout(durationTimer);
			});
		});
}

interval(500)
	.pipe(take(5), debounceTime(1000))
	.subscribe(
		v => {
			console.log('value: ', v);
		}
		// err => {},
		// () => {
		// 	console.debug('=======');
		// 	interval(500)
		// 		.pipe(take(5), debounceTime(1000))
		// 		.subscribe(v => {
		// 			console.log('value: ', v);
		// 		});
		// }
	);
