/**
 * Merge map to operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, OperatorFunction, ObservableInput } from 'rxjs';
import { mergeMapTo as mergeMapToOriginal } from 'rxjs/operators';

export function mergeMapTo<T, O extends Observable<any>>(
	innerObservable: O,
	concurrent: number = Number.POSITIVE_INFINITY
) {
	return (source: Observable<Observable<T>>) =>
		new Observable<O>(observer => {
			let buffer = [];
			let subscriptions = [];

			function subscribeToNextBufferElement() {
				if (subscriptions.length < concurrent && buffer.length > 0) {
					// the value we got is an observable itself so we subscribe to it
					const obs = buffer.shift();
					let sub: Subscription;
					sub = innerObservable.subscribe(
						v => {
							observer.next(v);
						},
						err => {},
						() => {
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
					console.log('source value: ', value);
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

of(of(1, 2, 3), of(1, 2, 3))
	.pipe(mergeMapToOriginal(of(1, 1, 1)))
	.subscribe(
		v => {
			console.log('value: ', v);
		},
		null,
		() => {
			console.log('=====');
			of(of(1, 2, 3), of(1, 2, 3))
				.pipe(mergeMapTo(of(1, 1, 1)))
				.subscribe(v => {
					console.log('value: ', v);
				});
		}
	);
