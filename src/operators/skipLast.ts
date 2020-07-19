/**
 * Skip last operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval } from 'rxjs';

import { skipLast as skipLastOriginal } from 'rxjs/operators';

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

of(1, 2, 3)
	.pipe(skipLast(1))
	.subscribe(v => {
		console.log('value: ', v);
	});
