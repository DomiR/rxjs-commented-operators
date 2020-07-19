/**
 * Filter operator
 *
 * @see
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval, empty, VirtualTimeScheduler } from 'rxjs';

import { filter as filterOriginal } from 'rxjs/operators';

export function filter<T>(predicate: (value: T, index: number) => boolean) {
	return (source: Observable<T>) =>
		new Observable<T>(observer => {
			let stillEvery = true;
			let index = 0;
			const sourceSubscription = source.subscribe(
				value => {
					console.log('source value: ', value);
					if (predicate(value, index++)) {
						observer.next(value);
					}
				},
				err => {
					console.log('source err: ', err);
					observer.error(err);
				},
				() => {
					console.log('source complete');
					observer.complete();
				}
			);

			return new Subscription(() => {
				sourceSubscription.unsubscribe();
			});
		});
}

of(1, 2, 1000, 3)
	.pipe(filter(v => v < 100))
	.subscribe(v => {
		console.log('value: ', v);
	});
