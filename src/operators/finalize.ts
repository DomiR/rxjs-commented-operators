/**
 * Finalize operator
 *
 * @see
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval, empty, VirtualTimeScheduler } from 'rxjs';

import { take } from 'rxjs/operators';
import { finalize as finalizeOriginal } from 'rxjs/operators';

export function finalize<T>(callback: () => void) {
	return (source: Observable<T>) =>
		new Observable<T>(observer => {
			const sourceSubscription = source.subscribe(
				value => {
					console.log('source value: ', value);
					observer.next(value);
				},
				err => {
					console.log('source err: ', err);
					callback();
					observer.error(err);
				},
				() => {
					console.log('source complete');
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
			console.log('finally');
		})
	)
	.subscribe(v => {
		console.log('value: ', v);
	});
