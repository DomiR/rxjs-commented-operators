/**
 * Sample time operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval, Subscribable, Subject } from 'rxjs';

import { take } from 'rxjs/operators';
import { sampleTime as sampleTimeOriginal } from 'rxjs/operators';

export function sampleTime<T>(period: number) {
	return (source: Observable<T>) => {
		return new Observable<T>(observer => {
			let lastValue = null;

			const sourceSubscription = source.subscribe(
				value => {
					lastValue = value;
				},
				err => observer.error(),
				() => observer.complete()
			);

			const interval = setInterval(() => {
				if (lastValue != null) {
					observer.next(lastValue);
					lastValue = null;
				}
			}, period);

			// return subscription, which will unsubscribe from inner observable
			return new Subscription(() => {
				sourceSubscription.unsubscribe();
				clearInterval(interval);
			});
		});
	};
}

interval(100)
	.pipe(take(5), sampleTimeOriginal(400))
	.subscribe(
		v => {
			console.log('value: ', v);
		},
		null,
		() => {
			console.log('====');
			interval(100)
				.pipe(take(5), sampleTime(400))
				.subscribe(v => {
					console.log('value: ', v);
				});
		}
	);
