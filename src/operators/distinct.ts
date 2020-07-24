/**
 * Distinct operator
 *
 * @see
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

export function distinct<T, K>(keySelector?: (value: T) => K, flushes?: Observable<any>) {
	return (source: Observable<T>) =>
		new Observable<T>(observer => {
			let set = new Set();

			const sourceSubscription = source.subscribe(
				value => {
					console.log('source value: ', value);
					const key = keySelector != null ? keySelector(value) : value;
					if (!set.has(key)) {
						set.add(key);
						observer.next(value);
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

			const flushSubscription = flushes?.subscribe(() => {
				set.clear();
			});

			return new Subscription(() => {
				sourceSubscription.unsubscribe();
				flushSubscription?.unsubscribe();
			});
		});
}

of(1, 1, 2, 3)
	.pipe(take(5))
	.pipe(distinct())
	.subscribe(v => {
		console.log('value: ', v);
	});
