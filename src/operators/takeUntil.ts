/**
 * Take until operator
 *
 * @see
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval, empty, VirtualTimeScheduler } from 'rxjs';

import { take, skip } from 'rxjs/operators';
import { takeUntil as takeUntilOriginal } from 'rxjs/operators';

export function takeUntil<T>(notifier: Observable<any>) {
	return (source: Observable<T>) =>
		new Observable<T>(observer => {
			const sourceSubscription = source.subscribe(
				value => {
					console.log('source value: ', value);
					observer.next(value);
				},
				err => {
					console.log('source err: ', err);
					observer.error(err);
				},
				() => {
					console.log('source complete');
					observer.complete();
				}
			);

			const notificationSubscription = notifier.subscribe(
				value => {
					observer.complete();
					sourceSubscription.unsubscribe();
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
interval(1000)
	.pipe(take(5))
	.pipe(takeUntil(timer(2000)))
	.subscribe(v => {
		console.log('value: ', v, ' at: ', Date.now() - currentTime);
	});
