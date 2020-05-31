/**
 * audit operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval } from 'rxjs';
import { logValue } from '../utils';

export function skipLast<T>(count: number) {
	return (source: Observable<T>) =>
		new Observable<T>(observer => {
			let skipBuffer = [];
			const sourceSubscription = source.subscribe(
				value => {
					skipBuffer.push(value);
					if (skipBuffer.length > count) {
						observer.next(skipBuffer.shift());
					}
				},
				observer.error,
				observer.complete
			);

			// return subscription, which will unsubscribe from inner observable
			return new Subscription(() => {
				sourceSubscription.unsubscribe();
			});
		});
}

interval(100)
	.pipe(skipLast(3))
	.subscribe(v => {
		logValue('value: ', v);
	});
