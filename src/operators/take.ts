/**
 * Take operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval } from 'rxjs';

import { take as takeOriginal } from 'rxjs/operators';

export function take<T>(count: number) {
	return (source: Observable<T>) =>
		new Observable<T>(observer => {
			let takeCount = count;
			const sourceSubscription = source.subscribe(
				value => {
					if (takeCount > 0) {
						takeCount--;
						observer.next(value);
					} else {
						observer.complete();
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
	.pipe(take(2))
	.subscribe(v => {
		console.log('value: ', v);
	});
