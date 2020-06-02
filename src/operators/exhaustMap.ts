/**
 * Exhaust map operator
 *
 * @see
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { interval, Observable, Subscription } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { logValue } from '../utils';

export function exhaustMap<T, R, O extends Observable<R>>(project: (value: T, index: number) => O) {
	return (source: Observable<T>) =>
		new Observable<R>(observer => {
			let runningSubscription: Subscription = null;
			let didComplete = false;
			let index = 0;
			const sourceSubscription = source.subscribe(
				value => {
					if (runningSubscription == null) {
						const innerObservable = project(value, index);
						runningSubscription = innerObservable.subscribe(
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
					index += 1;
				},
				err => {
					logValue('source err: ', err);
					observer.error(err);
				},
				() => {
					logValue('source complete');
					// observer.complete();
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

const currentTime = Date.now();
console.log('start', Date.now() - currentTime);
interval(1000)
	.pipe(take(5))
	.pipe(exhaustMap(i => interval(1000)))
	.subscribe(v => {
		logValue('value: ', v, ' at: ', Date.now() - currentTime);
	});
