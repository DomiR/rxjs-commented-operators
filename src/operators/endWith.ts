/**
 * End with operator
 *
 * @see
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval, empty, VirtualTimeScheduler } from 'rxjs';
import { logValue } from '../utils';
import { endWith as endWithOriginal } from 'rxjs/operators';

export function endWith<T>(...array: T[]) {
	return (source: Observable<T>) =>
		new Observable<T>(observer => {
			const sourceSubscription = source.subscribe(
				value => {
					logValue('source value: ', value);
					observer.next(value);
				},
				err => {
					logValue('source err: ', err);
					observer.error(err);
				},
				() => {
					logValue('source complete');
					for (const lastValues of array) {
						observer.next(lastValues);
					}
					observer.complete();
				}
			);

			return new Subscription(() => {
				sourceSubscription.unsubscribe();
			});
		});
}

of(1, 2, 3)
	.pipe(endWith(1000, 2000))
	.subscribe(v => {
		logValue('value: ', v);
	});
