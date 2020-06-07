/**
 * Start with operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval } from 'rxjs';
import { logValue } from '../utils';
import { isArray } from 'util';
import { startWith as startWithOriginal } from 'rxjs/operators';

export function startWith<T, R>(...array: any) {
	return (source: Observable<T>) => {
		const valueList = isArray(array[0]) ? array[0] : array;

		return new Observable<T>(observer => {
			for (const value of valueList) {
				observer.next(value);
			}

			const sourceSubscription = source.subscribe(observer);

			// return subscription, which will unsubscribe from inner observable
			return new Subscription(() => {
				sourceSubscription.unsubscribe();
			});
		});
	};
}

of(1, 2, 3)
	.pipe(startWith(10))
	.subscribe(v => {
		logValue('value: ', v);
	});
