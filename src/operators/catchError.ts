/**
 * Catch error operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer } from 'rxjs';
import { map } from 'rxjs/operators';

// catchError will get passed a selector function
// which determines what to subscribe next to, so the
// selector needs to return a new observable
export function catchError<T>(selector: (err: any, caught?: Observable<T>) => any) {
	// at this point we need to return a function
	// this function get's the source observable as an argument
	// (which later get's "piped" into this operator)
	return (source: Observable<T>) =>
		// we then return a new observable factory,
		// which internally needs to subscribe to the source observable
		new Observable<T>(observer => {
			// as we need to build new subscriptions if some error is thrown
			// and we need to store the current subscriptions into some variable
			// for clean up purposes.
			// This way we can unsubscribe whenever this operator is unsubscribed from
			let sourceSubscription;
			// using this helper function we can recursively resubscribe
			// to observables, whenever a error was catched
			function subscribeToSource(innerSource) {
				sourceSubscription = innerSource.subscribe(
					// we pass through all values
					value => {
						console.log('source value: ', value);
						observer.next(value);
					},
					// but we handle the error case with this operator
					err => {
						console.log('source err: ', err);
						try {
							// we pass the err to the user, so he can build
							// a replacement observable, which we then need to re-
							// subscribe to.
							// The selector get's passed the error but also the source observable,
							// so you can easily resubscribe to the current observer chain when building our own retry.
							const result = selector(err, innerSource);
							// we also unsubscribe from current subscription to source.
							// In case of synchronous source creation this might not be set yet,
							// which is why we need to check for null
							if (sourceSubscription != null) sourceSubscription.unsubscribe();
							// and then we re-subscribe to the new result from the selector
							subscribeToSource(result);
						} catch (nextErr) {
							// if we catch an error while calling the selector
							// or subscribing to the returned value fails we
							// error out this observable
							observer.error(nextErr);
						}
					},
					// we also pass through all complete eventss
					() => {
						console.log('source complete');
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

// use this to compare the results
import { catchError as catchErrorOriginal } from 'rxjs/operators';

// our example will throw on 4 but then catch and continue with 6 through 8
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
