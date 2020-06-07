/**
 * Exhaust operator
 *
 * @see
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval, empty, VirtualTimeScheduler } from 'rxjs';
import { logValue } from '../utils';
import { take, map } from 'rxjs/operators';
import { exhaust as exhaustOriginal } from 'rxjs/operators';

export function exhaust<V, T extends Observable<V>>() {
	return (source: Observable<T>) =>
		new Observable<V>(observer => {
			let runningSubscription: Subscription = null;
			let didComplete = false;

			const sourceSubscription = source.subscribe(
				value => {
					if (runningSubscription == null) {
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

of(1, 2, 3)
	.pipe(map(i => of('what')))
	.pipe(exhaust())
	.subscribe(v => {
		logValue('value: ', v);
	});
