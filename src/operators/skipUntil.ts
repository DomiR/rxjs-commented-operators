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
import { take, skip } from 'rxjs/operators';

export function skipUntil<T>(notifier: Observable<any>) {
	return (source: Observable<T>) =>
		new Observable<T>(observer => {
			let isSkipping = true;
			const sourceSubscription = source.subscribe(
				value => {
					logValue('source value: ', value);
					if (!isSkipping) {
						observer.next(value);
					}
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

			const notificationSubscription = notifier.subscribe(
				value => {
					isSkipping = false;
				},
				err => {},
				() => {}
			);

			return new Subscription(() => {
				sourceSubscription.unsubscribe();
				notificationSubscription.unsubscribe();
			});
		});
}

const currentTime = Date.now();
console.log('start', Date.now() - currentTime);
interval(1000)
	.pipe(take(5))
	.pipe(skipUntil(timer(2000)))
	.subscribe(v => {
		logValue('value: ', v, ' at: ', Date.now() - currentTime);
	});
