/**
 * Skip while operator
 *
 * @see
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval, empty, VirtualTimeScheduler } from 'rxjs';

import { take } from 'rxjs/operators';
import { skipWhile as skipWhileOriginal } from 'rxjs/operators';

export function skipWhile<T>(predicate: (value: T, index: number) => boolean) {
	return (source: Observable<T>) =>
		new Observable<T>(observer => {
			let isSkipping = true;
			let index = 0;
			const sourceSubscription = source.subscribe(
				value => {
					console.log('source value: ', value);
					if (!isSkipping) {
						observer.next(value);
					} else if (!predicate(value, index++)) {
						isSkipping = false;
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

const currentTime = Date.now();
interval(100)
	.pipe(take(5))
	.pipe(skipWhileOriginal(v => v < 2))
	.subscribe(
		v => {
			console.log('value: ', v, ' at: ', Date.now() - currentTime);
		},
		null,
		() => {
			console.log('=====');
			interval(100)
				.pipe(take(5))
				.pipe(
					skipWhile(v => {
						// console.log('skip while: ', v);
						return v < 2;
					})
				)
				.subscribe(
					v => {
						console.log('value: ', v, ' at: ', Date.now() - currentTime);
					},
					null,
					() => {
						console.log('=====');
					}
				);
		}
	);
