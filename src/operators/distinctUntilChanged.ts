/**
 * Distinct until changed operator
 *
 * @see
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval, empty, VirtualTimeScheduler } from 'rxjs';

import { take } from 'rxjs/operators';
import { distinctUntilChanged as distinctUntilChangedOriginal } from 'rxjs/operators';

export function distinctUntilChanged<T, K>(
	compare?: (x: K, y: K) => boolean,
	keySelector?: (x: T) => K
) {
	return (source: Observable<T>) =>
		new Observable<T>(observer => {
			let lastKey = null;

			const sourceSubscription = source.subscribe(
				value => {
					console.log('source value: ', value);
					const key: any = keySelector != null ? keySelector(value) : value;
					if (compare != null ? !compare(key as any, lastKey as any) : key !== lastKey) {
						observer.next(value);
						lastKey = key;
					}
				},
				err => {
					console.log('source err: ', err);
					observer.error(err);
				},
				() => {
					console.log('source complete');
					observer.complete();
				}
			);

			return new Subscription(() => {
				sourceSubscription.unsubscribe();
			});
		});
}
of(1, 1, 2, 3)
	.pipe(take(5))
	.pipe(distinctUntilChanged())
	.subscribe(v => {
		console.log('value: ', v);
	});
