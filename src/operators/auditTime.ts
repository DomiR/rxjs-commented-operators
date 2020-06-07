/**
 * Audit time operator
 *
 * The original implementation is just using audit with a timer
 * but this implementation uses timeout.
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval } from 'rxjs';
import { logValue } from '../utils';
import { auditTime as auditTimeOriginal, take } from 'rxjs/operators';

export function auditTime<T, U>(duration: number) {
	return (source: Observable<T>) =>
		new Observable<T>(observer => {
			let auditValue: T = null;
			let durationTimer = null;
			const sourceSubscription = source.subscribe(
				value => {
					// As soon as we get our first value we have to descide:
					// If we have no duration selector running,
					// we call our durationSelector function to get an observable.
					if (durationTimer == null) {
						durationTimer = setTimeout(() => {
							durationTimer = null;
							if (value != null) {
								observer.next(auditValue);
							}
						}, duration);
					}
					// In case a duration subscription is running we
					// cache the latest value for later.
					else {
						auditValue = value;
					}
				},
				err => {
					throw err;
				},
				() => {
					observer.complete();
				}
			);

			// return subscription, which will unsubscribe from inner observable
			return new Subscription(() => {
				sourceSubscription.unsubscribe();
				clearTimeout(durationTimer);
			});
		});
}

interval(100)
	.pipe(auditTime(300), take(5))
	.subscribe(v => {
		logValue('value: ', v);
	});
