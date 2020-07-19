/**
 * End with operator
 *
 * @see
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval, empty, VirtualTimeScheduler } from 'rxjs';

import { endWith as endWithOriginal } from 'rxjs/operators';

export function endWith<T>(...array: T[]) {
	return (source: Observable<T>) =>
		new Observable<T>(observer => {
			const sourceSubscription = source.subscribe(
				value => {
					console.log('source value: ', value);
					observer.next(value);
				},
				err => {
					console.log('source err: ', err);
					observer.error(err);
				},
				() => {
					console.log('source complete');
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
		console.log('value: ', v);
	});
