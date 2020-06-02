/**
 * Repeat when operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval, Subscribable, Subject } from 'rxjs';
import { logValue } from '../utils';
import { take } from 'rxjs/operators';

export function repeatWhen<T>(notifier: (notifications: Observable<any>) => Observable<any>) {
	return (source: Observable<T>) => {
		return new Observable<T>(observer => {
			let sourceSubscription: Subscription;
			let notificationSubject = new Subject();
			let notifierObservable = notifier(notificationSubject);

			function resubscribeIfNotDone() {
				sourceSubscription = source.subscribe(
					value => {
						observer.next(value);
					},
					observer.error,
					() => {
						notificationSubject.next();
					}
				);
			}

			const notificationSubscription = notifierObservable.subscribe(
				() => {
					resubscribeIfNotDone();
				},
				observer.error,
				observer.complete
			);

			resubscribeIfNotDone();

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
		repeatWhen(notifications => notifications)
	)
	.subscribe(v => {
		logValue('value: ', v);
	});
