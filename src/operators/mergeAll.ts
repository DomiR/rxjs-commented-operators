/**
 * Merge all operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, OperatorFunction, ObservableInput } from 'rxjs';
import { mergeAll as mergeAllOriginal } from 'rxjs/operators';

export function mergeAll<T>(concurrent: number = Number.POSITIVE_INFINITY) {
	return (source: Observable<Observable<T>>) =>
		new Observable<T>(observer => {
			let buffer = [];
			let subscriptions = [];

			function subscribeToNextBufferElement() {
				if (subscriptions.length > concurrent && buffer.length > 0) {
					// the value we got is an observable itself so we subscribe to it
					const obs = buffer.shift();
					const sub = obs.subscribe(
						v => {
							observer.next(v);
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

of(of(1, 2, 3), of(4, 5, 6))
	.pipe(mergeAllOriginal())
	.subscribe(v => {
		console.log('value: ', v);
	});
