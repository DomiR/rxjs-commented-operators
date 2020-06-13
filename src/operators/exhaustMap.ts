/**
 * Exhaust map operator
 *
 * @see
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { interval, Observable, Subscription, of } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { logValue } from '../utils';
import { exhaustMap as exhaustMapOriginal } from 'rxjs/operators';

export function exhaustMap<T, R, O extends Observable<R>>(project: (value: T, index: number) => O) {
	return (source: Observable<T>) =>
		new Observable<R>(observer => {
			let runningSubscription: Subscription = null;
			let didComplete = false;
			let index = 0;
			const sourceSubscription = source.subscribe(
				value => {
					if (runningSubscription == null || runningSubscription.closed) {
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

of(1, 2, 3)
	.pipe(take(5))
	.pipe(exhaustMap(i => of(`what: ${i}`)))
	.subscribe(v => {
		logValue('value: ', v);
	});
