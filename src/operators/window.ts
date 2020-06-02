/**
 * audit operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { interval, Observable, SchedulerLike, Subscription, Subject, observable } from 'rxjs';
import { logValue } from '../utils';

export function window<T>(windowBoundaries: Observable<any>) {
	return (source: Observable<T>) =>
		new Observable<Subject<T>>(observer => {
			let currentWindowSubject = new Subject<T>();
			observer.next(currentWindowSubject);
			const sourceSubscription = source.subscribe(
				value => {
					currentWindowSubject.next(value);
				},
				observer.error,
				() => {
					currentWindowSubject.complete();
					observer.complete();
				}
			);

			const bounderySubscription = windowBoundaries.subscribe(
				v => {
					currentWindowSubject.complete();
					currentWindowSubject = new Subject<T>();
					observer.next(currentWindowSubject);
				},
				err => {},
				() => {}
			);

			// return subscription, which will unsubscribe from inner observable
			return new Subscription(() => {
				sourceSubscription.unsubscribe();
				bounderySubscription.unsubscribe();
			});
		});
}

interval(100)
	.pipe(window(interval(1000)))
	.subscribe(v => {
		logValue('value: ', v);
	});
