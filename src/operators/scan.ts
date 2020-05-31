/**
 * audit operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval } from 'rxjs';
import { logValue } from '../utils';
import { isArray } from 'util';

export function scan<T, R>(
	accumulator: (acc: T | R, value: T, index?: number) => T | R,
	seed?: T | R
) {
	return (source: Observable<T>) => {
		return new Observable<T | R>(observer => {
			let accValue = seed;
			let index = 0;
			const sourceSubscription = source.subscribe(
				value => {
					accValue = accumulator(accValue, value, index++);
					observer.next(accValue);
				},
				observer.error,
				() => {
					observer.complete();
				}
			);

			// return subscription, which will unsubscribe from inner observable
			return new Subscription(() => {
				sourceSubscription.unsubscribe();
			});
		});
	};
}

interval(100)
	.pipe(scan((acc, val) => acc + val, 0))
	.subscribe(v => {
		logValue('value: ', v);
	});