/**
 * audit operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval, Subscribable, Subject } from 'rxjs';
import { logValue } from '../utils';
import { take } from 'rxjs/operators';

export function sample<T>(notifier: Observable<any>) {
	return (source: Observable<T>) => {
		return new Observable<T>(observer => {
			let lastValue = null;

			const sourceSubscription = source.subscribe(
				value => {
					lastValue = value;
				},
				observer.error,
				observer.complete
			);

			const notificationSubscription = notifier.subscribe(
				value => {
					if (lastValue != null) {
						observer.next(lastValue);
						lastValue = null;
					}
				},
				err => {},
				() => {}
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
	.pipe(take(5), sample(interval(1000)))
	.subscribe(v => {
		logValue('value: ', v);
	});
