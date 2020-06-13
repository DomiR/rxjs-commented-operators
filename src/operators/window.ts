/**
 * Window operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { interval, Observable, Subscription, Subject, timer } from 'rxjs';
import { logValue } from '../utils';
import { window as windowOriginal, take } from 'rxjs/operators';

export function window<T>(windowBoundaries: Observable<any>) {
	return (source: Observable<T>) =>
		new Observable<Subject<T>>(observer => {
			let currentWindowSubject = new Subject<T>();
			observer.next(currentWindowSubject);
			const sourceSubscription = source.subscribe(
				value => {
					logValue('source value: ', value);
					currentWindowSubject.next(value);
				},
				err => {
					logValue('source error', err);
					observer.error(err);
				},
				() => {
					logValue('source close');
					currentWindowSubject.complete();
					observer.complete();
				}
			);

			const bounderySubscription = windowBoundaries.subscribe(
				v => {
					logValue('boundary value');
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

let index = 0;
interval(100)
	.pipe(take(10))
	.pipe(windowOriginal(interval(300)))
	.subscribe(
		v => {
			let obsIndex = index++;
			v.subscribe(x => {
				logValue('value: ', x, ' from: ', obsIndex);
			});
		},
		null,
		() => {
			console.log('=====');
			index = 0;
			interval(100)
				.pipe(take(10))
				.pipe(window(interval(300)))
				.subscribe(
					v => {
						let obsIndex = index++;
						v.subscribe(x => {
							logValue('value: ', x, ' from: ', obsIndex);
						});
					},
					null,
					() => {
						console.log('=====');
					}
				);
		}
	);
