/**
 * Default if empty operator
 *
 * @see
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval, empty } from 'rxjs';
import { logValue } from '../utils';
import { defaultIfEmpty as defaultIfEmptyOriginal } from 'rxjs/operators';

export function defaultIfEmpty<T, R>(defaultValue: R = null) {
	return (source: Observable<T>) =>
		new Observable<T | R>(observer => {
			let isEmpty = true;

			const sourceSubscription = source.subscribe(
				value => {
					logValue('source value: ', value);
					isEmpty = false;
					observer.next(value);
				},
				err => {
					logValue('source err: ', err);
					observer.error(err);
				},
				() => {
					logValue('source complete');

					if (isEmpty) {
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

empty()
	.pipe(defaultIfEmpty(12))
	.subscribe(v => {
		logValue('value: ', v);
	});
