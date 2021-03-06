/**
 * Throttle time operator
 *
 * @see
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval, empty, VirtualTimeScheduler } from 'rxjs';

import { take } from 'rxjs/operators';
import { ObserveOnSubscriber } from 'rxjs/internal/operators/observeOn';
import { throttleTime as throttleTimeOriginal } from 'rxjs/operators';

interface ThrottleConfig {
	leading?: boolean;
	trailing?: boolean;
}

export function throttleTime<T>(
	duration: number,
	config: ThrottleConfig = { leading: true, trailing: false }
) {
	return (source: Observable<T>) =>
		new Observable<T>(observer => {
			let innerTimer;
			let valueBuffer;
			const sourceSubscription = source.subscribe(
				value => {
					console.log('source value: ', value);
					if (innerTimer != null) {
						// skip this value
						valueBuffer = value;
					} else {
						if (config.leading) {
							observer.next(value);
						}

						innerTimer = setTimeout(() => {
							// if trailinig
							if (config.trailing && valueBuffer != null) {
								observer.next(valueBuffer);
								valueBuffer = null;
							}
							innerTimer = null;
						}, duration);
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
				clearTimeout(innerTimer);
				sourceSubscription.unsubscribe();
			});
		});
}

let currentTime = Date.now();
console.log('start', Date.now() - currentTime);
interval(100)
	.pipe(take(5))
	.pipe(throttleTimeOriginal(50))
	.subscribe(
		v => {
			console.log('value: ', v, ' at: ', Date.now() - currentTime);
		},
		null,
		() => {
			console.log('=====');
			currentTime = Date.now();
			interval(100)
				.pipe(take(5))
				.pipe(throttleTime(50))
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
