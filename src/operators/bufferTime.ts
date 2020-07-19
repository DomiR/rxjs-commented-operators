/**
 * Buffer time operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval } from 'rxjs';

import { bufferTime as bufferTimeOriginal, take } from 'rxjs/operators';

export function bufferTime<T>(bufferTimeSpan: number) {
	return (source: Observable<T>) =>
		new Observable<T[]>(observer => {
			let buffer: T[] = [];
			let bufferTimeSpanInterval;

			// If creation interval is not set we need to create our default buffer list empty array entry

			// Every buffer time stamp we publish the buffer and reset.
			bufferTimeSpanInterval = setInterval(() => {
				observer.next(buffer);
				buffer = [];
			}, bufferTimeSpan);

			const sourceSubscription = source.subscribe(
				value => {
					console.log('source value: ', value);
					// We store our value in every buffer we currently have open
					buffer.push(value);
				},
				err => {
					console.log('source err: ', err);
					observer.error(err);
				},
				() => {
					console.log('source complete');
					if (buffer.length > 0) {
						observer.next(buffer);
					}
					observer.complete();
				}
			);

			// return subscription, which will unsubscribe from inner observable
			return new Subscription(() => {
				sourceSubscription.unsubscribe();
				clearInterval(bufferTimeSpanInterval);
			});
		});
}

interval(500)
	.pipe(take(5), bufferTime(1000))
	.subscribe(v => {
		console.log('value: ', v);
	});
