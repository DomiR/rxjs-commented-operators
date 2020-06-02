/**
 * Map operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription } from 'rxjs';

export function map<T, U>(cb: (v: T) => U) {
	return (source: Observable<T>) =>
		new Observable<U>(observer => {
			const subscription = source.subscribe(
				value => {
					const mappedValue = cb(value);
					observer.next(mappedValue);
				},
				err => {
					observer.error(err);
				},
				() => {
					observer.complete();
				}
			);

			// return subscription, which will
			return new Subscription(() => {
				subscription.unsubscribe();
			});
		});
}

of(1, 2, 3)
	.pipe(map(v => v + 1))
	.subscribe(v => {
		console.log('value: ', v);
	});
