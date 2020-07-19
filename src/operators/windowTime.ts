/**
 * Window time operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval, Subject } from 'rxjs';

import { windowTime as windowTimeOriginal, take } from 'rxjs/operators';

export function windowTime<T>(windowTimeSpan: number) {
	return (source: Observable<T>) =>
		new Observable<Subject<T>>(observer => {
			let windowSubject = new Subject<T>();

			const sourceSubscription = source.subscribe(
				value => {
					console.log('source value: ', value);
					windowSubject.next(value);
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

let index = 0;
interval(100)
	.pipe(take(10))
	.pipe(windowTimeOriginal(500))
	.subscribe(
		v => {
			let obsIndex = index++;
			v.subscribe(x => {
				console.log('value: ', x, ' from: ', obsIndex);
			});
		},
		null,
		() => {
			console.log('=====');
			index = 0;
			interval(100)
				.pipe(take(10))
				.pipe(windowTime(500))
				.subscribe(v => {
					let obsIndex = index++;
					v.subscribe(x => {
						console.log('value: ', x, ' from: ', obsIndex);
					});
				});
		}
	);
