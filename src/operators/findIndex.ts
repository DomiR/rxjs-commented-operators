/**
 * Find index operator
 *
 * @see
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval, empty, VirtualTimeScheduler } from 'rxjs';

import { findIndex as findIndexOriginal } from 'rxjs/operators';

export function findIndex<T>(
	predicate: (value: T, index?: number, source?: Observable<T>) => boolean
) {
	return (source: Observable<T>) =>
		new Observable<number>(observer => {
			let i = 0;
			let shouldComplete = true;

			const sourceSubscription = source.subscribe(
				value => {
					console.log('source value: ', value);
					if (predicate(value, i, source)) {
						observer.next(i);
						observer.complete();
						shouldComplete = false;
					}
					i += 1;
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
	.pipe(findIndex(i => i > 100))
	.subscribe(v => {
		console.log('value: ', v);
	});
