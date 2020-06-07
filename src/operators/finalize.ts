/**
 * Finalize operator
 *
 * @see
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval, empty, VirtualTimeScheduler } from 'rxjs';
import { logValue } from '../utils';
import { take } from 'rxjs/operators';
import { finalize as finalizeOriginal } from 'rxjs/operators';

export function finalize<T>(callback: () => void) {
	return (source: Observable<T>) =>
		new Observable<T>(observer => {
			const sourceSubscription = source.subscribe(
				value => {
					logValue('source value: ', value);
					observer.next(value);
				},
				err => {
					logValue('source err: ', err);
					callback();
					observer.error(err);
				},
				() => {
					logValue('source complete');
					callback();
					observer.complete();
				}
			);

			return new Subscription(() => {
				sourceSubscription.unsubscribe();
			});
		});
}

of(1, 2, 3)
	.pipe(
		finalize(() => {
			logValue('finally');
		})
	)
	.subscribe(v => {
		logValue('value: ', v);
	});
