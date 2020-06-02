/**
 * audit operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval } from 'rxjs';
import { logValue } from '../utils';

export function throwIfEmpty<T>(errorFactory: () => any = () => new Error('empty')) {
	return (source: Observable<T>) =>
		new Observable<T>(observer => {
			let hasValue = false;
			const sourceSubscription = source.subscribe(
				value => {
					// We just call the print callback and procede as normal
					hasValue = true;
					observer.next(value);
				},
				observer.error,
				() => {
					if (!hasValue) {
						const err = errorFactory();
						observer.error(err);
					} else {
						observer.complete();
					}
				}
			);

			// return subscription, which will unsubscribe from inner observable
			return new Subscription(() => {
				sourceSubscription.unsubscribe();
			});
		});
}

interval(100)
	.pipe(throwIfEmpty(() => new Error('throw if error')))
	.subscribe(v => {
		logValue('value: ', v);
	});
