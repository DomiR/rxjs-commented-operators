/**
 * Buffer count operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval, Subject } from 'rxjs';
import { logValue } from '../utils';

export function windowTime<T>(windowTimeSpan: number) {
	return (source: Observable<T>) =>
		new Observable<Subject<T>>(observer => {
			let windowSubject = new Subject<T>();

			const sourceSubscription = source.subscribe(
				value => {
					logValue('source value: ', value);
					windowSubject.next(value);
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
			observer.next(windowSubject);

			const windowInterval = setInterval(() => {
				windowSubject.complete();
				windowSubject = new Subject<T>();
				observer.next(windowSubject);
			}, windowTimeSpan);

			// return subscription, which will unsubscribe from inner observable
			return new Subscription(() => {
				clearInterval(windowInterval);
				windowSubject.complete();
				sourceSubscription.unsubscribe();
			});
		});
}

interval(500)
	.pipe(windowTime(1000))
	.subscribe(v => {
		logValue('value: ', v);
	});
