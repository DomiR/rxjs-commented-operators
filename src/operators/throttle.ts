/**
 * Throttle operator
 *
 * @see
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval, empty, VirtualTimeScheduler } from 'rxjs';
import { logValue } from '../utils';
import { take } from 'rxjs/operators';
import { ObserveOnSubscriber } from 'rxjs/internal/operators/observeOn';
import { throttle as throttleOriginal } from 'rxjs/operators';

interface ThrottleConfig {
	leading?: boolean;
	trailing?: boolean;
}

export function throttle<T>(
	durationSelector: (value: T) => Observable<any>,
	config: ThrottleConfig = { leading: true, trailing: false }
) {
	return (source: Observable<T>) =>
		new Observable<T>(observer => {
			let innerSubscription: Subscription;
			let valueBuffer;
			const sourceSubscription = source.subscribe(
				value => {
					logValue('source value: ', value);
					if (innerSubscription != null) {
						// skip this value
						valueBuffer = value;
					} else {
						if (config.leading) {
							observer.next(value);
						}
						const innerObservable = durationSelector(value);
						innerSubscription = innerObservable.subscribe(v => {
							// if trailinig
							if (config.trailing && valueBuffer != null) {
								observer.next(valueBuffer);
								valueBuffer = null;
							}
							innerSubscription.unsubscribe();
							innerSubscription = null;
						});
					}
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

			return new Subscription(() => {
				innerSubscription?.unsubscribe();
				sourceSubscription.unsubscribe();
			});
		});
}

let currentTime = Date.now();
interval(100)
	.pipe(take(5))
	.pipe(throttleOriginal(v => timer(50)))
	.subscribe(
		v => {
			logValue('value: ', v, ' at: ', Date.now() - currentTime);
		},
		null,
		() => {
			console.log('=====');
			currentTime = Date.now();
			interval(100)
				.pipe(take(5))
				.pipe(throttleOriginal(v => timer(50)))
				.subscribe(
					v => {
						logValue('value: ', v, ' at: ', Date.now() - currentTime);
					},
					null,
					() => {
						console.log('=====');
					}
				);
		}
	);
