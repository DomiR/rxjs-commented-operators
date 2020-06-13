/**
 * Sample operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval, Subscribable, Subject } from 'rxjs';
import { logValue } from '../utils';
import { take, finalize } from 'rxjs/operators';
import { sample as sampleOriginal } from 'rxjs/operators';

export function sample<T>(notifier: Observable<any>) {
	return (source: Observable<T>) => {
		return new Observable<T>(observer => {
			let lastValue = null;

			const sourceSubscription = source.subscribe(
				value => {
					console.log('source value: ', value);
					lastValue = value;
				},
				err => {
					console.log('source error: ', err);
					observer.error(err);
				},
				() => {
					console.log('source complete');
					observer.complete();
				}
			);

			const notificationSubscription = notifier.subscribe(
				value => {
					console.debug('notifier next');
					if (lastValue != null) {
						observer.next(lastValue);
						lastValue = null;
					}
				},
				err => {
					console.debug('notifier error');
				},
				() => {
					console.debug('notifier complete');
				}
			);

			// return subscription, which will unsubscribe from inner observable
			return new Subscription(() => {
				sourceSubscription.unsubscribe();
				notificationSubscription.unsubscribe();
			});
		});
	};
}

interval(100)
	.pipe(
		take(5),
		finalize(() => {
			logValue('source closed');
		}),
		sampleOriginal(interval(300))
	)
	.subscribe(
		v => {
			logValue('value: ', v);
		},
		null,
		() => {
			console.log('=====');

			interval(100)
				.pipe(take(5), sample(interval(300)))
				.subscribe(v => {
					logValue('value: ', v);
				});
		}
	);
