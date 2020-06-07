/**
 * Window when operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval, Subject } from 'rxjs';
import { logValue } from '../utils';
import { windowWhen as windowWhenOriginal, take } from 'rxjs/operators';

export function windowWhen<T>(closingSelector: () => Observable<any>) {
	return (source: Observable<T>) =>
		new Observable<Subject<T>>(observer => {
			let windowSubject: Subject<T> = null;
			let closingSubscription: Subscription;

			const sourceSubscription = source.subscribe(
				value => {
					logValue('source value: ', value);

					if (windowSubject == null) {
						windowSubject = new Subject();
						observer.next(windowSubject);
						windowSubject.next(value);
						const closingObservable = closingSelector();
						closingSubscription = closingObservable.subscribe(() => {
							// Emit buffer, then reset it whenever the closing Observable emits a value
							windowSubject.complete();
							windowSubject = null;
						});
					} else {
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

			// return subscription, which will unsubscribe from inner observable
			return new Subscription(() => {
				sourceSubscription.unsubscribe();
				closingSubscription?.unsubscribe();
			});
		});
}

let index = 0;
interval(100)
	.pipe(take(10))
	.pipe(windowWhenOriginal(() => interval(950)))
	.subscribe(v => {
		let obsIndex = index++;
		v.subscribe(x => {
			logValue('value: ', x, ' from: ', obsIndex);
		});
	});
