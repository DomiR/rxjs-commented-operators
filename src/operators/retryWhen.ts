/**
 * audit operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval, Subscribable, Subject } from 'rxjs';
import { logValue } from '../utils';
import { take } from 'rxjs/operators';

export function retryWhen<T>(notifier: (notifications: Observable<any>) => Observable<any>) {
	return (source: Observable<T>) => {
		return new Observable<T>(observer => {
			let sourceSubscription: Subscription;
			let notificationSubject = new Subject();
			let notifierObservable = notifier(notificationSubject);

			function resubscribeIfNotDone(err) {
				sourceSubscription = source.subscribe(
					value => {
						observer.next(value);
					},
					e => notificationSubject.next(e),
					() => {
						observer.complete();
					}
				);
			}

			const notificationSubscription = notifierObservable.subscribe(
				err => {
					resubscribeIfNotDone(err);
				},
				observer.error,
				observer.complete
			);

			resubscribeIfNotDone(null);

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
		retryWhen(notifications => notifications)
	)
	.subscribe(v => {
		logValue('value: ', v);
	});
