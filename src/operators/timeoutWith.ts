/**
 * audit operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { interval, Observable, SchedulerLike, Subscription, of } from 'rxjs';
import { async } from 'rxjs/internal/scheduler/async';
import { logValue } from '../utils';
import { ObserveOnSubscriber } from 'rxjs/internal/operators/observeOn';

export function timeoutWith<T>(due: number, withObservable: any, scheduler: SchedulerLike = async) {
	return (source: Observable<T>) =>
		new Observable<T>(observer => {
			let timeOut;
			let sourceSubscription: Subscription;
			function resetTimer() {
				clearTimeout(timeOut);
				setTimeout(() => {
					observer.error('did timeout');
					sourceSubscription.unsubscribe();
					sourceSubscription = withObservable.subscribe(observer);
				}, due as number);
			}

			resetTimer();

			sourceSubscription = source.subscribe(
				value => {
					resetTimer();
					observer.next(value);
				},
				observer.error,
				observer.complete
			);

			// return subscription, which will unsubscribe from inner observable
			return new Subscription(() => {
				sourceSubscription.unsubscribe();
			});
		});
}

interval(1000)
	.pipe(timeoutWith(1100, of(1)))
	.subscribe(v => {
		logValue('value: ', v);
	});
