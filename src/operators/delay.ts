/**
 * Delay operator
 *
 * @see
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval, empty } from 'rxjs';

import { take } from 'rxjs/operators';
import { delay as delayOriginal } from 'rxjs/operators';

export function delay<T, R>(delayValue: number) {
	return (source: Observable<T>) =>
		new Observable<T | R>(observer => {
			let didComplete = false;
			let buffer: { value: T; time: number }[] = [];
			let timer;

			function runTimer() {
				if (buffer.length > 0) {
					const v = buffer.shift();
					timer = setTimeout(() => {
						observer.next(v.value as T);
						if (didComplete) {
							observer.complete();
						} else {
							runTimer();
						}
					}, v.time - Date.now());
				}
			}

			const sourceSubscription = source.subscribe(
				value => {
					console.log('source value: ', value);
					buffer.push({
						value: value,
						time: Date.now() + delayValue,
					});
					runTimer();
				},
				err => {
					console.log('source err: ', err);
					clearTimeout(timer);
					observer.error(err);
				},
				() => {
					console.log('source complete');
					didComplete = true;
					if (buffer.length === 0 && timer == null) {
						observer.complete();
					}
				}
			);

			return new Subscription(() => {
				clearTimeout(timer);
				sourceSubscription.unsubscribe();
			});
		});
}
const currentTime = Date.now();
console.log('start', Date.now() - currentTime);
interval(1000)
	.pipe(take(5))
	.pipe(delay(1000))
	.subscribe(v => {
		console.log('value: ', v, ' at: ', Date.now() - currentTime);
	});
