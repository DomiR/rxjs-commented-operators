/**
 * Merge map operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, OperatorFunction, ObservableInput } from 'rxjs';
import { mergeMap as mergeMapOriginal, map } from 'rxjs/operators';
import { log } from 'console';

export function mergeMap<T, O extends Observable<any>>(
	project: (value: T, index: number) => O,
	concurrent: number = Number.POSITIVE_INFINITY
) {
	return (source: Observable<Observable<T>>) =>
		new Observable<O>(observer => {
			let buffer = [];
			let subscriptions = [];
			let index = 0;

			function subscribeToNextBufferElement() {
				if (subscriptions.length < concurrent && buffer.length > 0) {
					// the value we got is an observable itself so we subscribe to it
					const value = buffer.shift();
					const obs = project(value, index++);
					let sub: Subscription;
					sub = obs.subscribe(
						v => {
							observer.next(v);
						},
						err => {},
						() => {
							console.log('inner complete');
							if (sub) {
								subscriptions.splice(subscriptions.indexOf(sub), 1);
							}
							console.log('subscriptions', subscriptions.length);
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
					buffer.push(value);
					subscribeToNextBufferElement();
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
				for (const sub of subscriptions) {
					sub.unsubscribe();
				}
				subscription.unsubscribe();
			});
		});
}

of(of(1, 2, 3), of(4, 5, 6))
	.pipe(mergeMapOriginal((v: any) => v.pipe(map((x: any) => x + 1))))
	.subscribe(
		v => {
			console.log('value: ', v);
		},
		null,
		() => {
			console.log('====');
			of(of(1, 2, 3), of(4, 5, 6))
				.pipe(
					mergeMap((v: any) => {
						console.debug('merging: ', v);
						return v.pipe(map((x: any) => x + 1));
					})
				)
				.subscribe(v => {
					console.log('value: ', v);
				});
		}
	);
