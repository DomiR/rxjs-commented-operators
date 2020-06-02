/**
 * Merge map operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, OperatorFunction, ObservableInput } from 'rxjs';

export function mergeMap<T, O>(
	project: (value: T, index: number) => O,
	concurrent: number = Number.POSITIVE_INFINITY
) {
	return (source: Observable<Observable<T>>) =>
		new Observable<O>(observer => {
			let buffer = [];
			let subscriptions = [];
			let index = 0;

			function subscribeToNextBufferElement() {
				if (subscriptions.length > concurrent && buffer.length > 0) {
					// the value we got is an observable itself so we subscribe to it
					const obs = buffer.shift();
					const sub = obs.subscribe(
						v => {
							const mappedValue = project(v, index++);
							observer.next(mappedValue);
						},
						err => {},
						() => {
							subscriptions.splice(subscriptions.indexOf(sub), 1);
							subscribeToNextBufferElement();
						}
					);
					subscriptions.push(sub);
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

of(of(1, 2, 3), of(1, 2, 3))
	.pipe(mergeMap(v => v + 1))
	.subscribe(v => {
		console.log('value: ', v);
	});
