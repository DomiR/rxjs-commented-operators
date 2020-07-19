/**
 * Pairwise operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval } from 'rxjs';

import { take } from 'rxjs/operators';
import { pairwise as pairwiseOriginal } from 'rxjs/operators';

export function pairwise<T>() {
	return (source: Observable<T>) =>
		new Observable<[T, T]>(observer => {
			let lastValue = null;
			const sourceSubscription = source.subscribe(
				value => {
					// We just call the print callback and procede as normal
					if (lastValue == null) {
						lastValue = value;
					} else {
						observer.next([lastValue, value]);
						lastValue = value;
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
	.pipe(pairwise())
	.subscribe(v => {
		console.log('value: ', v);
	});
