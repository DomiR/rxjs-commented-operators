/**
 * Skip operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval } from 'rxjs';

import { skip as skipOriginal, take } from 'rxjs/operators';

export function skip<T>(count: number) {
	return (source: Observable<T>) =>
		new Observable<T>(observer => {
			let skipCount = count;
			const sourceSubscription = source.subscribe(
				value => {
					if (skipCount > 0) {
						skipCount--;
					} else {
						observer.next(value);
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
	.pipe(take(5), skipOriginal(3))
	.subscribe(
		v => {
			console.log('value: ', v);
		},
		null,
		() => {
			console.log('=====');

			interval(100)
				.pipe(take(5), skip(3))
				.subscribe(
					v => {
						console.log('value: ', v);
					},
					null,
					() => {
						console.log('=====');
					}
				);
		}
	);
