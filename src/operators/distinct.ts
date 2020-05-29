/**
 * last operator
 *
 * @see
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval, empty } from 'rxjs';
import { logValue } from '../utils';
import { take } from 'rxjs/operators';

export function distinct<T, K>(keySelector?: (value: T) => K, flushes?: Observable<any>) {
	return (source: Observable<T>) =>
		new Observable<T>(observer => {
			let set = new Set();

			const sourceSubscription = source.subscribe(
				value => {
					logValue('source value: ', value);
					const key = keySelector(value) ?? value;
					if (!set.has(key)) {
						set.add(key);
						observer.next(value);
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

			const flushSubscription = flushes?.subscribe(() => {
				set.clear();
			});

			return new Subscription(() => {
				sourceSubscription.unsubscribe();
				flushSubscription?.unsubscribe();
			});
		});
}
const currentTime = Date.now();
console.log('start', Date.now() - currentTime);
interval(1000)
	.pipe(take(5))
	.pipe(distinct())
	.subscribe(v => {
		logValue('value: ', v, ' at: ', Date.now() - currentTime);
	});
