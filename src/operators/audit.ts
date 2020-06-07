/**
 * Audit operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval } from 'rxjs';
import { logValue } from '../utils';
import { audit as auditOriginal, take } from 'rxjs/operators';

export function audit<T, U>(durationSelector: (value: T) => Observable<U>) {
	return (source: Observable<T>) =>
		new Observable<T>(observer => {
			let latestValue: T = null;
			let durationSubscription: Subscription = null;
			const sourceSubscription = source.subscribe(
				value => {
					latestValue = value;

					// As soon as we get our first value we have to descide:
					// If we have no duration selector running,
					// we call our durationSelector function to get an observable.
					if (durationSubscription == null) {
						const durationObservable = durationSelector(value);

						// We subscribe to to the duration observable.
						durationSubscription = durationObservable.subscribe(
							durationValue => {
								// As soon as we get our first value from the duration observable
								// we unsubscribe from it.
								durationSubscription.unsubscribe();
								durationSubscription = null;
								if (latestValue != null) {
									observer.next(latestValue);
								}
							},
							durationErr => {
								// hmm? in the original implementation this is not handled
								// maybe we rethrow the error
								throw durationErr;
							},
							() => {
								// we do the same here as when getting a value
								durationSubscription.unsubscribe();
								durationSubscription = null;
								if (latestValue != null) {
									observer.next(value);
								}
							}
						);
					}
				},
				err => {
					throw err;
				},
				() => {
					observer.complete();
				}
			);

			// return subscription, which will unsubscribe from inner observable
			return new Subscription(() => {
				sourceSubscription.unsubscribe();

				// we might have a duration subscription running, so unsubscribe
				durationSubscription?.unsubscribe();
			});
		});
}

interval(100)
	.pipe(
		audit(value => timer(300)),
		take(5)
	)
	.subscribe(v => {
		logValue('value: ', v);
	});
