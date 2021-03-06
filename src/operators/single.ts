/**
 * Single operator
 *
 * @see
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval, empty, VirtualTimeScheduler } from 'rxjs';

import { take, map } from 'rxjs/operators';
import { single as singleOriginal } from 'rxjs/operators';

export function single<T>(
	predicate?: (value: T, index?: number, source?: Observable<T>) => boolean
) {
	return (source: Observable<T>) =>
		new Observable<T>(observer => {
			let i = 0;
			let didComplete = false;

			const sourceSubscription = source.subscribe(
				value => {
					console.log('source value: ', value);
					if (didComplete) {
						observer.error();
					} else {
						if (predicate == null || predicate(value, i++, source)) {
							observer.next(value);
							observer.complete();
							didComplete = true;
						}
					}
				},
				err => {
					console.log('source err: ', err);
					observer.error(err);
				},
				() => {
					console.log('source complete');
					if (!didComplete) {
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
	.pipe(single(i => i > 100))
	.subscribe(v => {
		console.log('value: ', v);
	});
