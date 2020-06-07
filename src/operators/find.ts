/**
 * Find operator
 *
 * @see
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval, empty, VirtualTimeScheduler } from 'rxjs';
import { logValue } from '../utils';
import { find as findOriginal } from 'rxjs/operators';

export function find<T>(predicate: (value: T, index?: number, source?: Observable<T>) => boolean) {
	return (source: Observable<T>) =>
		new Observable<T>(observer => {
			let i = 0;
			let shouldComplete = true;

			const sourceSubscription = source.subscribe(
				value => {
					logValue('source value: ', value);
					if (predicate(value, i++, source)) {
						observer.next(value);
						observer.complete();
						shouldComplete = false;
					}
				},
				err => {
					logValue('source err: ', err);
					observer.error(err);
				},
				() => {
					logValue('source complete');
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
	.pipe(find(i => i > 100))
	.subscribe(v => {
		logValue('value: ', v);
	});
