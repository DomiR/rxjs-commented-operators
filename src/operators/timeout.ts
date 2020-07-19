/**
 * Timeout operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { interval, Observable, SchedulerLike, Subscription } from 'rxjs';
import { async } from 'rxjs/internal/scheduler/async';

import { timeout as timeoutOriginal } from 'rxjs/operators';

export function timeout<T>(due: number | Date, scheduler: SchedulerLike = async) {
	return (source: Observable<T>) =>
		new Observable<T>(observer => {
			let timeOut;
			function resetTimer() {
				clearTimeout(timeOut);
				setTimeout(() => {
					observer.error('did timeout');
					sourceSubscription.unsubscribe();
				}, due as number);
			}
			if (typeof due === 'number') {
				resetTimer();
			}

			const sourceSubscription = source.subscribe(
				value => {
					if (typeof due === 'number') {
						resetTimer();
						observer.next(value);
					} else {
						if (Date.now() < due.getTime()) {
							observer.next(value);
						} else {
							observer.error('did timeout');
							sourceSubscription.unsubscribe();
						}
					}
				},
				observer.error,
				observer.complete
			);

			// return subscription, which will unsubscribe from inner observable
			return new Subscription(() => {
				sourceSubscription.unsubscribe();
			});
		});
}

interval(1000)
	.pipe(timeout(900))
	.subscribe(
		v => {
			console.log('value: ', v);
		},
		err => {
			console.log('expected timeout error');
		}
	);
