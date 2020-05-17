/**
 * Buffer operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval } from 'rxjs';
import { logValue } from '../utils';

export function buffer<T, U>(closingNotifier: Observable<U>) {
	return (source: Observable<T>) =>
		new Observable<U[]>(observer => {
			let buffer = [];

			const sourceSubscription = source.subscribe(
				value => {
					logValue('source value: ', value);
					buffer.push(value);
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

			const closingNotifierSubscription = closingNotifier.subscribe(
				value => {
					logValue('closingNotifier: ', value);
					observer.next(buffer);
				},
				err => {
					logValue('closingNotifier err: ', err);
				},
				() => {
					logValue('closingNotifier complete');
					observer.complete();
				}
			);

			// return subscription, which will unsubscribe from inner observable
			return new Subscription(() => {
				sourceSubscription.unsubscribe();
				closingNotifierSubscription.unsubscribe();
			});
		});
}

interval(500)
	.pipe(buffer(timer(500)))
	.subscribe(v => {
		logValue('value: ', v);
	});
