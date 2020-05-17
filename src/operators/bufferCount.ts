/**
 * map operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval } from 'rxjs';
import { logValue } from '../utils';

export function bufferCount<T>(bufferSize: number, startBufferEvery: number = null) {
	return (source: Observable<T>) =>
		new Observable<T[]>(observer => {
			let bufferList: T[][] = [];
			let buffer = [];
			let count = 0;

			const sourceSubscription = source.subscribe(
				value => {
					logValue('source value: ', value);

					// The original operator handles both cases
					// in a very otimized manner, but we do
					// not have to do so.
					if (startBufferEvery != null) {
						count += 1;
						// If the start bufferEvery is set, we need to
						// build up new a new buffer every time
						// our count reaches that number by pushing
						// an emtpy array to our buffer list.
						if (count % startBufferEvery) {
							bufferList.push([]);
						}

						// Then we go through all buffers in buffer list and
						// check if they have bufferSize items already.
						// If so, we emit that buffer and remove from this list.
						for (const buffer of bufferList) {
							buffer.push(value);
							if (buffer.length === bufferSize) {
								observer.next(buffer);
								bufferList.slice(bufferList.indexOf(buffer), 1);
							}
						}
					} else {
						buffer.push(value);
						if (buffer.length === bufferSize) {
							observer.next(buffer);
							buffer = [];
						}
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
			});
		});
}

interval(500)
	.pipe(bufferCount(3, 2))
	.subscribe(v => {
		logValue('value: ', v);
	});
