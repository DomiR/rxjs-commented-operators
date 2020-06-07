/**
 * Delay when operator
 *
 * @see
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval, empty } from 'rxjs';
import { logValue } from '../utils';
import { take } from 'rxjs/operators';
import { ObserveOnSubscriber } from 'rxjs/internal/operators/observeOn';
import { delayWhen as delayWhenOriginal } from 'rxjs/operators';

export function delayWhen<T, R>(
	delayDurationSelector: (value: T, index: number) => Observable<any>
) {
	return (source: Observable<T>) =>
		new Observable<T | R>(observer => {
			let didComplete = false;
			let buffer: { value: T; subscription: any }[] = [];
			let index = 0;

			const sourceSubscription = source.subscribe(
				value => {
					logValue('source value: ', value);
					const durationSelection = delayDurationSelector(value, (index += 1));
					const bufferEntry = {
						value: value,
						subscription: durationSelection.subscribe(() => {
							observer.next(value);
							buffer.splice(buffer.indexOf(bufferEntry), 1);
							if (buffer.length === 0 && didComplete) {
								observer.complete();
							}
						}),
					};
					buffer.push(bufferEntry);
				},
				err => {
					logValue('source err: ', err);
					observer.error(err);
				},
				() => {
					logValue('source complete');
					didComplete = true;
					if (buffer.length === 0) {
						observer.complete();
					}
				}
			);

			return new Subscription(() => {
				for (const b of buffer) {
					b.subscription.unsubscribe();
				}
				sourceSubscription.unsubscribe();
			});
		});
}

const currentTime = Date.now();
console.log('start', Date.now() - currentTime);
interval(1000)
	.pipe(take(5))
	.pipe(delayWhen(() => timer(100)))
	.subscribe(v => {
		logValue('value: ', v, ' at: ', Date.now() - currentTime);
	});
