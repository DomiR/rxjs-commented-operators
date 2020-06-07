/**
 * Take while operator
 *
 * @see
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, range, Subscription } from 'rxjs';
import { logValue } from '../utils';
import { takeWhile as takeWhileOriginal } from 'rxjs/operators';

export function takeWhile<T>(predicate: (value: T, index: number) => boolean) {
	return (source: Observable<T>) =>
		new Observable<T>(observer => {
			let index = 0;
			const sourceSubscription = source.subscribe(
				value => {
					logValue('source value: ', value);
					if (predicate(value, index++)) {
						observer.next(value);
					} else {
						observer.complete();
						sourceSubscription.unsubscribe();
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

			return new Subscription(() => {
				sourceSubscription.unsubscribe();
			});
		});
}

range(1, 10)
	.pipe(takeWhile(v => v < 5))
	.subscribe(v => {
		logValue('value: ', v);
	});
