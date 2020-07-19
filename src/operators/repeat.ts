/**
 * Repeat operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval, Subscribable } from 'rxjs';

import { take } from 'rxjs/operators';
import { repeat as repeatOriginal } from 'rxjs/operators';

export function repeat<T, R>(count: number = -1) {
	return (source: Observable<T>) => {
		return new Observable<T | R>(observer => {
			let sourceSubscription: Subscription;
			let countLeft = count;
			function resubscribeIfNotDone() {
				if (countLeft > 0) {
					countLeft--;
					sourceSubscription = source.subscribe(
						value => {
							observer.next(value);
						},
						observer.error,
						() => {
							resubscribeIfNotDone();
						}
					);
				} else {
					observer.complete();
				}
			}

			resubscribeIfNotDone();

			// return subscription, which will unsubscribe from inner observable
			return new Subscription(() => {
				sourceSubscription.unsubscribe();
			});
		});
	};
}

of(1, 2, 3)
	.pipe(repeat(2))
	.subscribe(v => {
		console.log('value: ', v);
	});
