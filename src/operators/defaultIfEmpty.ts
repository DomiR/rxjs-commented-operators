/**
 * Default if empty operator
 *
 * @see
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval, empty } from 'rxjs';

import { defaultIfEmpty as defaultIfEmptyOriginal } from 'rxjs/operators';

export function defaultIfEmpty<T, R>(defaultValue: R = null) {
	return (source: Observable<T>) =>
		new Observable<T | R>(observer => {
			let isEmpty = true;

			const sourceSubscription = source.subscribe(
				value => {
					console.log('source value: ', value);
					isEmpty = false;
					observer.next(value);
				},
				err => {
					console.log('source err: ', err);
					observer.error(err);
				},
				() => {
					console.log('source complete');

					if (isEmpty) {
						observer.next(defaultValue);
					}
					observer.complete();
				}
			);

			return new Subscription(() => {
				sourceSubscription.unsubscribe();
			});
		});
}

empty()
	.pipe(defaultIfEmpty(12))
	.subscribe(v => {
		console.log('value: ', v);
	});
