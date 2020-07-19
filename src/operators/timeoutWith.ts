/**
 * Timeout with operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { interval, Observable, SchedulerLike, Subscription, of } from 'rxjs';
import { async } from 'rxjs/internal/scheduler/async';

import { timeoutWith as timeoutWithOriginal } from 'rxjs/operators';

export function timeoutWith<T>(due: number, withObservable: any, scheduler: SchedulerLike = async) {
	return (source: Observable<T>) =>
		new Observable<T>(observer => {
			let timeOut;
			let sourceSubscription: Subscription;
			function resetTimer() {
				clearTimeout(timeOut);
				timeOut = setTimeout(() => {
					sourceSubscription.unsubscribe();
					sourceSubscription = withObservable.subscribe(observer);
				}, due);
			}

			resetTimer();

			sourceSubscription = source.subscribe(
				value => {
					console.log('source value: ', value);
					resetTimer();
					observer.next(value);
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

			// return subscription, which will unsubscribe from inner observable
			return new Subscription(() => {
				sourceSubscription.unsubscribe();
			});
		});
}

interval(100)
	.pipe(timeoutWithOriginal(90, of('nice')))
	.subscribe(
		v => {
			console.log('value: ', v);
		},
		null,
		() => {
			console.log('=====');

			interval(100)
				.pipe(timeoutWith(90, of('nice')))
				.subscribe(
					v => {
						console.log('value: ', v);
					},
					null,
					() => {}
				);
		}
	);
