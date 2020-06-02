/**
 * Retry operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval, Subscribable } from 'rxjs';
import { logValue } from '../utils';
import { take } from 'rxjs/operators';

export function retry<T, R>(count: number = -1) {
	return (source: Observable<T>) => {
		return new Observable<T | R>(observer => {
			let sourceSubscription: Subscription;
			let countLeft = count;
			function resubscribeIfNotDone(err) {
				if (countLeft > 0) {
					countLeft--;
					sourceSubscription = source.subscribe(
						observer.next,
						err => resubscribeIfNotDone(err),
						observer.complete
					);
				} else {
					observer.error(err);
				}
			}

			resubscribeIfNotDone(null);

			// return subscription, which will unsubscribe from inner observable
			return new Subscription(() => {
				sourceSubscription.unsubscribe();
			});
		});
	};
}

interval(100)
	.pipe(take(5), retry(1))
	.subscribe(v => {
		logValue('value: ', v);
	});
