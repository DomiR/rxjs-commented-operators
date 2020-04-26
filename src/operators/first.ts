/**
 * map operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval } from 'rxjs';
import { logValue } from '../utils';

export function first<T>(
	predicate?: (value: T, index: number, source: Observable<T>) => boolean,
	defaultValue?: T
) {
	return (source: Observable<T>) =>
		new Observable<T>(observer => {
			const sourceSubscription = source.subscribe(
				value => {
					logValue('source value: ', value);
					observer.next(value);
					observer.complete();
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

			// return subscription, which will unsubscribe from inner observable
			return new Subscription(() => {
				sourceSubscription.unsubscribe();
			});
		});
}

interval(500)
	.pipe(first())
	.subscribe(v => {
		logValue('value: ', v);
	});
