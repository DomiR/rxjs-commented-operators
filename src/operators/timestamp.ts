/**
 * Timestamp operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { interval, Observable, SchedulerLike, Subscription } from 'rxjs';
import { async } from 'rxjs/internal/scheduler/async';
import { logValue } from '../utils';
import { timestamp as timestampOriginal, take } from 'rxjs/operators';

export function timestamp<T>(scheduler: SchedulerLike = async) {
	return (source: Observable<T>) =>
		new Observable<{ value: T; timestamp: number }>(observer => {
			const sourceSubscription = source.subscribe(
				value => {
					observer.next({ value, timestamp: scheduler.now() });
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

interval(100)
	.pipe(take(5))
	.pipe(timestamp())
	.subscribe(v => {
		logValue('value: ', v);
	});
