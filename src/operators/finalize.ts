/**
 * last operator
 *
 * @see
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval, empty, VirtualTimeScheduler } from 'rxjs';
import { logValue } from '../utils';
import { take } from 'rxjs/operators';

export function finalize<T>(callback: () => void) {
	return (source: Observable<T>) =>
		new Observable<T>(observer => {
			const sourceSubscription = source.subscribe(
				value => {
					logValue('source value: ', value);
					observer.next(value);
				},
				err => {
					logValue('source err: ', err);
					callback();
					observer.error(err);
				},
				() => {
					logValue('source complete');
					callback();
					observer.complete();
				}
			);

			return new Subscription(() => {
				sourceSubscription.unsubscribe();
			});
		});
}

const currentTime = Date.now();
console.log('start', Date.now() - currentTime);
interval(1000)
	.pipe(take(5))
	.pipe(
		finalize(() => {
			logValue('finally');
		})
	)
	.subscribe(v => {
		logValue('value: ', v, ' at: ', Date.now() - currentTime);
	});
