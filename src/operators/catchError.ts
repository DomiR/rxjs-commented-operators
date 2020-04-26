/**
 * map operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval } from 'rxjs';
import { map } from 'rxjs/operators';
import { logValue } from '../utils';

export function catchError<T>(selector: (err: any, caught?: Observable<T>) => any) {
	return (source: Observable<T>) =>
		new Observable<T>(observer => {
			let sourceSubscription;
			function subscribeToSource(innerSource) {
				sourceSubscription = innerSource.subscribe(
					value => {
						// we pass through all values
						logValue('source value: ', value);
						observer.next(value);
					},
					err => {
						logValue('source err: ', err);
						try {
							// We pass the err to the user, so he can build
							// a replacement observable, which we need to re-
							// subscribe to.
							const result = selector(err, innerSource);
							// Unsubscribe from current subscription to source.
							// In case of synchronous source creation like of
							// this might not be set yet.
							sourceSubscription?.unsubscribe();
							// And then we re-subscribe to the new result from the selector.
							subscribeToSource(result);
						} catch (nextErr) {
							observer.error(nextErr);
						}
					},
					() => {
						logValue('source complete');
						observer.complete();
					}
				);
			}

			// initially subscribe to the original source
			subscribeToSource(source);

			// return subscription, which will unsubscribe from inner observable
			return new Subscription(() => {
				sourceSubscription.unsubscribe();
			});
		});
}

of(1, 2, 3, 4, 5)
	.pipe(
		map(n => {
			if (n === 4) {
				throw 'four!';
			}
			return n;
		}),
		catchError(err => {
			return of(6, 7, 8);
		})
	)
	.subscribe(
		x => console.log(x),
		err => console.log(err)
	);
