/**
 * Take operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval, range } from 'rxjs';
import { logValue } from '../utils';

export function takeLast<T>(count: number) {
	return (source: Observable<T>) =>
		new Observable<T>(observer => {
			let buffer: T[] = [];
			const sourceSubscription = source.subscribe(
				value => {
					buffer.push(value);
					if (buffer.length > count) {
						buffer.shift();
					}
				},
				observer.error,
				() => {
					for (const v of buffer) {
						observer.next(v);
					}
					observer.complete();
				}
			);

			// return subscription, which will unsubscribe from inner observable
			return new Subscription(() => {
				sourceSubscription.unsubscribe();
			});
		});
}

range(1, 10)
	.pipe(takeLast(3))
	.subscribe(v => {
		logValue('value: ', v);
	});
