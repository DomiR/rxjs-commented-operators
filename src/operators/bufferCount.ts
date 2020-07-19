/**
 * Buffer count operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval, range } from 'rxjs';

import { bufferCount as bufferCountOriginal, take, tap } from 'rxjs/operators';

export function bufferCount<T>(bufferSize: number, startBufferEvery: number = null) {
	return (source: Observable<T>) =>
		new Observable<T[]>(observer => {
			let bufferList: T[][] = [];
			let buffer = [];
			let count = 0;

			const sourceSubscription = source.subscribe(
				value => {
					console.log('source value: ', value);

					// The original operator handles both cases
					// in a very otimized manner, but we do
					// not have to do so.
					if (startBufferEvery != null) {
						// If the start bufferEvery is set, we need to
						// build up new a new buffer every time
						// our count reaches that number by pushing
						// an emtpy array to our buffer list.
						if (count++ % startBufferEvery === 0) {
							// console.debug('start buffer');
							bufferList.push([]);
						}

						// Then we go through all buffers in buffer list and
						// check if they have bufferSize items already.
						// If so, we emit that buffer and remove from this list.
						const bufferListReversed = bufferList.reverse();
						for (let i = bufferListReversed.length - 1; i >= 0; i--) {
							bufferListReversed[i].push(value);
							if (bufferListReversed[i].length === bufferSize) {
								observer.next(bufferListReversed[i]);
								bufferListReversed.splice(i, 1);
							}
						}
						bufferList = bufferListReversed.reverse();
					} else {
						buffer.push(value);
						if (buffer.length === bufferSize) {
							observer.next(buffer);
							buffer = [];
						}
					}
				},
				err => {
					console.log('source err: ', err);
					observer.error(err);
				},
				() => {
					console.log('source complete');
					for (const buffer of bufferList) {
						observer.next(buffer);
					}
					observer.complete();
					// flush buffers
				}
			);

			// return subscription, which will unsubscribe from inner observable
			return new Subscription(() => {
				sourceSubscription.unsubscribe();
			});
		});
}

range(0, 5)
	.pipe(bufferCount(3, 2))
	.subscribe(v => {
		console.log('value: ', v);
	});
