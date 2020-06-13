/**
 * Merge scan operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, OperatorFunction, ObservableInput } from 'rxjs';
import { mergeScan as mergeScanOriginal, map } from 'rxjs/operators';
import { logValue } from '../utils';

export function mergeScan<T, R>(
	accumulator: (acc: R, value: Observable<T>, index: number) => any,
	seed: R,
	concurrent: number = Number.POSITIVE_INFINITY
) {
	return (source: Observable<Observable<T>>) =>
		new Observable<R>(observer => {
			let buffer = [];
			let subscriptions = [];
			let index = 0;
			let accValue = seed;
			let cachedValue = null;

			function subscribeToNextBufferElement() {
				if (subscriptions.length < concurrent && buffer.length > 0) {
					// the value we got is an observable itself so we subscribe to it
					const obs = buffer.shift();
					let sub: Subscription;
					const mappedObserver = accumulator(accValue, obs, index++);
					sub = mappedObserver.subscribe(
						v => {
							cachedValue = v;
							observer.next(cachedValue);
						},
						err => {},
						() => {
							accValue = cachedValue ?? seed;
							subscriptions.splice(subscriptions.indexOf(sub), 1);
							subscribeToNextBufferElement();
						}
					);
					if (sub && !sub.closed) {
						subscriptions.push(sub);
					}
				}
			}

			const subscription = source.subscribe(
				value => {
					logValue('source value: ', value);
					buffer.push(value);

					subscribeToNextBufferElement();
				},
				err => {
					logValue('source err: ', err);
					observer.error(err);
				},
				() => {
					logValue('source complete');
					observer.complete();
				}
			);

			// return subscription, which will
			return new Subscription(() => {
				for (const sub of subscriptions) {
					sub.unsubscribe();
				}
				subscription.unsubscribe();
			});
		});
}

of(of(1, 2, 3), of(1, 2, 3))
	.pipe(
		mergeScanOriginal((sum, a) => {
			console.debug('scan sum', sum);
			return a.pipe(
				map(x => {
					console.debug('scan x', sum, x);
					return x + sum;
				})
			);
		}, 0)
	)
	.subscribe(
		v => {
			console.log('value: ', v);
		},
		null,
		() => {
			console.log('=====');
			of(of(1, 2, 3), of(1, 2, 3))
				.pipe(
					mergeScan((sum, a) => {
						console.debug('scan sum', sum);
						return a.pipe(
							map(x => {
								console.debug('scan x', sum, x);
								return x + sum;
							})
						);
					}, 0)
				)
				.subscribe(v => {
					console.log('value: ', v);
				});
		}
	);
