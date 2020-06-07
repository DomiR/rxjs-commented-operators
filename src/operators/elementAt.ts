/**
 * Element at operator
 *
 * @see
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval, empty, VirtualTimeScheduler } from 'rxjs';
import { logValue } from '../utils';

export function elementAt<T>(index: number, defaultValue?: T) {
	return (source: Observable<T>) =>
		new Observable<T>(observer => {
			let i = 0;

			const sourceSubscription = source.subscribe(
				value => {
					logValue('source value: ', value);
					if (index === i++) {
						observer.next(value);
						observer.complete();
					}
				},
				err => {
					logValue('source err: ', err);
					observer.error(err);
				},
				() => {
					logValue('source complete');
					if (i < index) {
						observer.next(defaultValue);
					}
					observer.complete();
				}
			);

			return new Subscription(() => {
				sourceSubscription.unsubscribe();
			});
		});
}

of(1, 2, 3)
	.pipe(elementAt(1))
	.subscribe(v => {
		logValue('value: ', v);
	});
