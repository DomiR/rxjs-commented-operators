/**
 * Expand operator
 *
 * @see
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription } from 'rxjs';
import { delay, expand as expandOriginal, take } from 'rxjs/operators';
import { ofTimerAbsolute } from '../utils';

export function expand<V>(
	project: (value: V, index: number) => Observable<V>,
	concurrent: number = Number.POSITIVE_INFINITY
) {
	return (source: Observable<V>) =>
		new Observable<V>(observer => {
			let index = 0;
			let buffer: V[] = [];
			let subscriptions: Subscription[] = [];

			function subscribeToNextBufferElement() {
				if (subscriptions.length < concurrent && buffer.length > 0) {
					// the value we got is an observable itself so we subscribe to it
					const bufferedValue = buffer.shift();
					const obs = project(bufferedValue, index++);
					const sub = obs.subscribe(
						v => {
							observer.next(v);
							buffer.push(v);
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

			const sourceSubscription = source.subscribe(
				value => {
					// console.log('source value: ', value);
					observer.next(value);
					buffer.push(value);
					subscribeToNextBufferElement();
				},
				err => {
					console.log('source err: ', err);
					observer.error(err);
				},
				() => {
					console.log('source complete');
				}
			);

			return new Subscription(() => {
				sourceSubscription.unsubscribe();
			});
		});
}

ofTimerAbsolute(100, 300, 400)
	// .pipe(tap(v => console.log('source value', v)))
	.pipe(
		expandOriginal(
			v => of(v).pipe(delay(200))
			// .pipe(tap(v => console.log('expanded value', v)))
		)
	)
	.pipe(take(10))
	.subscribe(
		v => {
			console.log('value: ', v);
		},
		err => {},
		() => {
			console.debug('=======');
			ofTimerAbsolute(100, 300, 400)
				.pipe(expand(v => of(v).pipe(delay(200))))
				.pipe(take(10))
				.subscribe(
					v => {
						console.log('value: ', v);
					}
					// 	ofTimerAbsolute(100, 300, 400)
					// 		.pipe(map(i => ofTimer(150, 50)))
					// 		.pipe(expand())
					// 		.subscribe(v => {
					// 			console.log('value: ', v);
					// 		});
				);
		}
	);
