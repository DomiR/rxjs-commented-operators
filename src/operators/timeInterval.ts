/**
 * Time interval operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { interval, Observable, SchedulerLike, Subscription } from 'rxjs';
import { async } from 'rxjs/internal/scheduler/async';
import { logValue } from '../utils';
import { timeInterval as timeIntervalOriginal, take } from 'rxjs/operators';

export function timeInterval<T>(scheduler: SchedulerLike = async) {
	return (source: Observable<T>) =>
		new Observable<{ value: T; interval: number }>(observer => {
			let lastTime = scheduler.now();
			const sourceSubscription = source.subscribe(
				value => {
					const interval = scheduler.now() - lastTime;
					lastTime += interval;
					observer.next({ value, interval });
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
	.pipe(take(10))
	.pipe(timeInterval())
	.subscribe(v => {
		logValue('value: ', v);
	});
