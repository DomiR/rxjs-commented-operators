/**
 * Filter operator
 *
 * @see
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval, empty, VirtualTimeScheduler } from 'rxjs';
import { logValue } from '../utils';
import { filter as filterOriginal } from 'rxjs/operators';

export function filter<T>(predicate: (value: T, index: number) => boolean) {
	return (source: Observable<T>) =>
		new Observable<T>(observer => {
			let stillEvery = true;
			let index = 0;
			const sourceSubscription = source.subscribe(
				value => {
					logValue('source value: ', value);
					if (predicate(value, index++)) {
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

			return new Subscription(() => {
				sourceSubscription.unsubscribe();
			});
		});
}

of(1, 2, 1000, 3)
	.pipe(filter(v => v < 100))
	.subscribe(v => {
		logValue('value: ', v);
	});
