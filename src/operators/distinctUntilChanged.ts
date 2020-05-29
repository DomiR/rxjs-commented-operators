/**
 * last operator
 *
 * @see
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval, empty, VirtualTimeScheduler } from 'rxjs';
import { logValue } from '../utils';
import { take } from 'rxjs/operators';

export function distinctUntilChanged<T, K>(
	compare?: (x: K, y: K) => boolean,
	keySelector?: (x: T) => K
) {
	return (source: Observable<T>) =>
		new Observable<T>(observer => {
			let lastKey = null;

			const sourceSubscription = source.subscribe(
				value => {
					logValue('source value: ', value);
					const key: any = keySelector(value) ?? value;
					if (compare?.(key as any, lastKey as any) ?? key === lastKey) {
						observer.next(value);
						lastKey = key;
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
	.pipe(distinctUntilChanged())
	.subscribe(v => {
		logValue('value: ', v, ' at: ', Date.now() - currentTime);
	});
