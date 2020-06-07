/**
 * Every operator
 *
 * @see
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval, empty, VirtualTimeScheduler } from 'rxjs';
import { logValue } from '../utils';
import { every as everyOriginal } from 'rxjs/operators';

export function every<T>(predicate: (value: T, index: number, source: Observable<T>) => boolean) {
	return (source: Observable<T>) =>
		new Observable<boolean>(observer => {
			let stillEvery = true;
			let index = 0;
			const sourceSubscription = source.subscribe(
				value => {
					logValue('source value: ', value);
					if (stillEvery && !predicate(value, index++, source)) {
						stillEvery = false;
					}
				},
				err => {
					logValue('source err: ', err);
					observer.error(err);
				},
				() => {
					logValue('source complete');
					observer.next(stillEvery);
					observer.complete();
				}
			);

			return new Subscription(() => {
				sourceSubscription.unsubscribe();
			});
		});
}

of(1, 2, 3)
	.pipe(everyOriginal(v => v < 100000))
	.subscribe(v => {
		logValue('value: ', v);
	});
