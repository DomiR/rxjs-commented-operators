/**
 * Sequence Equal operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval } from 'rxjs';
import { logValue } from '../utils';

export function sequenceEqual<T>(
	compareTo: Observable<T>,
	comparator: (a: T, b: T) => boolean = (a, b) => a !== b
) {
	return (source: Observable<T>) => {
		return new Observable<boolean>(observer => {
			const sourceBuffer = [];
			const compareBuffer = [];

			function compareBuffers() {
				while (sourceBuffer.length > 0 && compareBuffer.length > 0) {
					const sourceVal = sourceBuffer.shift();
					const compareVal = compareBuffer.shift();
					const isEqual = comparator(sourceVal, compareVal);
					if (!isEqual) {
						observer.next(false);
						observer.complete();
						break;
					}
				}
			}

			const sourceSubscription = source.subscribe(
				value => {
					sourceBuffer.push(value);
					compareBuffers();
				},
				observer.error,
				() => {
					if (sourceBuffer.length === 0 && compareBuffer.length === 0) {
						observer.next(true);
						observer.complete();
					}
				}
			);

			const compareSubscription = source.subscribe(
				value => {
					compareBuffer.push(value);
					compareBuffers();
				},
				observer.error,
				() => {
					if (sourceBuffer.length === 0 && compareBuffer.length === 0) {
						observer.next(true);
						observer.complete();
					}
				}
			);

			// return subscription, which will unsubscribe from inner observable
			return new Subscription(() => {
				sourceSubscription.unsubscribe();
				compareSubscription.unsubscribe();
			});
		});
	};
}

interval(100)
	.pipe(sequenceEqual(interval(100)))
	.subscribe(v => {
		logValue('value: ', v);
	});
