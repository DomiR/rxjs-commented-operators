/**
 * Take while operator
 *
 * @see
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval, empty, VirtualTimeScheduler } from 'rxjs';
import { logValue } from '../utils';
import { take } from 'rxjs/operators';

export function takeWhile<T>(predicate: (value: T, index: number) => boolean) {
	return (source: Observable<T>) =>
		new Observable<T>(observer => {
			let index = 0;
			const sourceSubscription = source.subscribe(
				value => {
					logValue('source value: ', value);
					if (predicate(value, index++)) {
						observer.next(value);
					} else {
						observer.complete();
						sourceSubscription.unsubscribe();
					}
				},
				err => {
					logValue('source err: ', err);
					observer.error(err);
				},
				() => {
					logValue('source complete');
					observer.complete();
				}
			);

			return new Subscription(() => {
				sourceSubscription.unsubscribe();
			});
		});
}

const currentTime = Date.now();
console.log('start', Date.now() - currentTime);
interval(1000)
	.pipe(take(5))
	.pipe(takeWhile(v => v < 100000))
	.subscribe(v => {
		logValue('value: ', v, ' at: ', Date.now() - currentTime);
	});
