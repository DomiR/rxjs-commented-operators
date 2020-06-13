/**
 * Buffer when operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval } from 'rxjs';
import { logValue } from '../utils';
import { bufferWhen as bufferWhenOriginal, take, tap } from 'rxjs/operators';

let now = Date.now();

export function bufferWhen<T>(closingSelector: () => Observable<any>) {
	return (source: Observable<T>) =>
		new Observable<T[]>(observer => {
			let buffer: T[] = null;
			let closingSubscription: Subscription;

			function openBuffer() {
				const closingObservable = closingSelector();
				// console.debug('close subscribing at: ', `at ${Date.now() - now}`);
				closingSubscription = closingObservable.subscribe(
					() => {
						// console.debug('close next at: ', `at ${Date.now() - now}`);
						if (buffer != null) {
							observer.next(buffer);

							// TODO: original implmentation sets here emtpy array, which is questionale, as it will next [] when closing completes
							buffer = null;
						}
					},
					closingErr => {},
					() => {
						// console.debug('close complete at: ', `at ${Date.now() - now}`);
						openBuffer();
					}
				);
			}

			openBuffer();

			const sourceSubscription = source.subscribe(
				value => {
					logValue('source value: ', value);
					if (buffer == null) {
						buffer = [value];
					} else {
						buffer.push(value);
					}
				},
				err => {
					logValue('source err: ', err);
					observer.error(err);
				},
				() => {
					logValue('source complete');
					observer.next(buffer);
					observer.complete();
				}
			);

			// return subscription, which will unsubscribe from inner observable
			return new Subscription(() => {
				sourceSubscription.unsubscribe();
				closingSubscription?.unsubscribe();
			});
		});
}

interval(100)
	.pipe(
		take(5),
		bufferWhenOriginal(() => interval(160))
	)
	.subscribe(v => {
		logValue('value: ', v);
	});

// interval(100)
// 	.pipe(
// 		take(5),
// 		tap(
// 			x => console.debug('source value:', x, `at ${Date.now() - now}`),
// 			() => {},
// 			() => {
// 				console.debug('source complete', `at ${Date.now() - now}`);
// 			}
// 		),

// 		bufferWhenOriginal(() =>
// 			interval(160).pipe(tap(x => console.debug('buffer toggle on:', x, `at ${Date.now() - now}`)))
// 		)
// 	)
// 	.subscribe(
// 		v => {
// 			logValue('value: ', v);
// 		},
// 		() => {},
// 		() => {
// 			console.debug('========');
// 			now = Date.now();
// 			interval(100)
// 				.pipe(
// 					take(5),
// 					tap(
// 						x => console.debug('source value:', x, `at ${Date.now() - now}`),
// 						() => {},
// 						() => {
// 							console.debug('source complete', `at ${Date.now() - now}`);
// 						}
// 					),

// 					bufferWhen(() =>
// 						interval(160).pipe(
// 							tap(x => console.debug('buffer toggle on:', x, `at ${Date.now() - now}`))
// 						)
// 					)
// 				)
// 				.subscribe(v => {
// 					logValue('value: ', v);
// 				});
// 		}
// 	);
