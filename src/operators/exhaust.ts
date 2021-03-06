/**
 * Exhaust operator
 *
 * @see
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval, empty, VirtualTimeScheduler } from 'rxjs';
import { ofTimer, ofTimerAbsolute } from '../utils';
import { take, map } from 'rxjs/operators';
import { exhaust as exhaustOriginal } from 'rxjs/operators';

export function exhaust<V, T extends Observable<V>>() {
	return (source: Observable<T>) =>
		new Observable<V>(observer => {
			let runningSubscription: Subscription = null;
			let didComplete = false;

			const sourceSubscription = source.subscribe(
				value => {
					console.log('source value: ', value);
					if (runningSubscription == null || runningSubscription.closed) {
						runningSubscription = value.subscribe(
							v => {
								observer.next(v);
							},
							innerError => {},
							() => {
								runningSubscription = null;
								if (didComplete) {
									observer.complete();
								}
							}
						);
					}
				},
				err => {
					console.log('source err: ', err);
					observer.error(err);
				},
				() => {
					console.log('source complete');
					didComplete = true;
					if (runningSubscription == null) {
						observer.complete();
					}
				}
			);

			return new Subscription(() => {
				sourceSubscription.unsubscribe();
				runningSubscription?.unsubscribe();
			});
		});
}

ofTimerAbsolute(100, 300, 400)
	.pipe(map(i => ofTimer(150, 50)))
	.pipe(exhaustOriginal())
	.subscribe(
		v => {
			console.log('value: ', v);
		},
		err => {},
		() => {
			console.debug('=======');
			ofTimerAbsolute(100, 300, 400)
				.pipe(map(i => ofTimer(150, 50)))
				.pipe(exhaust())
				.subscribe(v => {
					console.log('value: ', v);
				});
		}
	);
