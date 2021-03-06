/**
 * First operator
 *
 * @see
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval, empty, VirtualTimeScheduler } from 'rxjs';

import { take, map } from 'rxjs/operators';
import { first as firstOriginal } from 'rxjs/operators';

export function first<T>(
	predicate?: (value: T, index?: number, source?: Observable<T>) => boolean
) {
	return (source: Observable<T>) =>
		new Observable<T>(observer => {
			let i = 0;
			let shouldComplete = true;

			const sourceSubscription = source.subscribe(
				value => {
					console.log('source value: ', value);
					if (predicate == null || predicate(value, i++, source)) {
						observer.next(value);
						observer.complete();
						shouldComplete = false;
					}
				},
				err => {
					console.log('source err: ', err);
					observer.error(err);
				},
				() => {
					console.log('source complete');
					if (shouldComplete) {
						observer.complete();
					}
				}
			);

			return new Subscription(() => {
				sourceSubscription.unsubscribe();
			});
		});
}

of(1, 2, 1000, 3)
	.pipe(first(i => i > 100))
	.subscribe(v => {
		console.log('value: ', v);
	});
