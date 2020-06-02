/**
 * Window toggle operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval, Subject } from 'rxjs';
import { logValue } from '../utils';
import { take } from 'rxjs/operators';

export function windowToggle<T, O>(
	openings: Observable<O>,
	closingSelector: (openValue: O) => Observable<any>
) {
	return (source: Observable<T>) =>
		new Observable<Subject<T>>(observer => {
			let windowSubject: Subject<T> = null;

			const sourceSubscription = source.subscribe(
				value => {
					logValue('source value: ', value);
					if (windowSubject != null) {
						windowSubject.next(value);
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
			let closingSubscription: Subscription;
			const openingSubscription = openings.subscribe(
				openingValue => {
					const closingObservable = closingSelector(openingValue);
					closingSubscription = closingObservable.subscribe(
						() => {
							closingSubscription.unsubscribe();
							windowSubject?.complete();
							windowSubject = null;
						},
						err => {},
						() => {
							closingSubscription.unsubscribe();
							windowSubject?.complete();
							windowSubject = null;
						}
					);
				},
				err => {},
				() => {}
			);

			// return subscription, which will unsubscribe from inner observable
			return new Subscription(() => {
				sourceSubscription.unsubscribe();
				closingSubscription?.unsubscribe();
				openingSubscription.unsubscribe();
			});
		});
}

interval(500)
	.pipe(windowToggle(interval(1000).pipe(take(3)), value => timer(1000)))
	.subscribe(v => {
		logValue('value: ', v);
	});
