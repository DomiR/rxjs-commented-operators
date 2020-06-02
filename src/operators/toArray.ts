/**
 * audit operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { interval, Observable, SchedulerLike, Subscription } from 'rxjs';
import { logValue } from '../utils';

export function toArray<T>() {
	return (source: Observable<T>) =>
		new Observable<T[]>(observer => {
			const buffer = [];
			const sourceSubscription = source.subscribe(
				value => {
					buffer.push(value);
				},
				observer.error,
				() => {
					observer.next(buffer);
					observer.complete();
				}
			);

			// return subscription, which will unsubscribe from inner observable
			return new Subscription(() => {
				sourceSubscription.unsubscribe();
			});
		});
}

interval(100)
	.pipe(toArray())
	.subscribe(v => {
		logValue('value: ', v);
	});
