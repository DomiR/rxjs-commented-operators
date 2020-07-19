/**
 * Take while operator
 *
 * @see
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, range, Subscription } from 'rxjs';

import { takeWhile as takeWhileOriginal } from 'rxjs/operators';

export function takeWhile<T>(predicate: (value: T, index: number) => boolean) {
	return (source: Observable<T>) =>
		new Observable<T>(observer => {
			let index = 0;
			let sourceSubscription: Subscription;
			sourceSubscription = source.subscribe(
				value => {
					console.log('source value: ', value);
					if (predicate(value, index++)) {
						observer.next(value);
					} else {
						observer.complete();
						sourceSubscription?.unsubscribe();
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

range(1, 10)
	.pipe(takeWhileOriginal(v => v < 5))
	.subscribe(
		v => {
			console.log('value: ', v);
		},
		null,
		() => {
			console.log('=====');

			range(1, 10)
				.pipe(takeWhile(v => v < 5))
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
