/**
 * Distict until key changed operator
 *
 * @see
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval, empty, VirtualTimeScheduler } from 'rxjs';
import { logValue } from '../utils';
import { take, map } from 'rxjs/operators';
import { distinctUntilKeyChanged as distinctUntilKeyChangedOriginal } from 'rxjs/operators';

export function distinctUntilKeyChanged<T, K extends keyof T>(
	key: K,
	compare?: (x: T[K], y: T[K]) => boolean
) {
	return (source: Observable<T>) =>
		new Observable<T>(observer => {
			let lastKey = null;

			const sourceSubscription = source.subscribe(
				value => {
					logValue('source value: ', value);
					const keyValue: any = value[key];
					if (compare != null ? !compare(keyValue as any, lastKey as any) : keyValue !== lastKey) {
						observer.next(value);
						lastKey = keyValue;
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

of(1, 1, 2, 3)
	.pipe(
		take(5),
		map(i => ({ time: i }))
	)
	.pipe(distinctUntilKeyChanged('time'))
	.subscribe(v => {
		logValue('value: ', v);
	});
