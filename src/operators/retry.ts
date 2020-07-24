/**
 * Retry operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { empty, Observable, of, Subscription } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

// retry will get a count passed, which is the number of
// errors it will silently catch and resubscribe to the source
// before finally passing the count + 1 error along
export function retry<T, R>(count: number = -1) {
	// as always we need to return a function
	// that get's the source observable passed in
	return (source: Observable<T>) => {
		// we then return a new observable factory,
		// which internally needs to subscribe to the source observable
		return new Observable<T | R>(observer => {
			// as we are going to resubscribe to the source multiple times
			// we just need a reference variable that holds the current subscription
			let currentSourceSubscription: Subscription;

			// we also need our resubscription counter
			// that gets decremented each time we subscribe to our source
			let countLeft = count;

			// to resubscribe more easily we build ourselves a helper function
			// that subscribes to the source if our counter is not below zero
			function resubscribeIfNotDone(err) {
				// we check if the counter is >= 0, because if we pass 1 as the initial counter
				// it will be decreased the first time and after 1 retry before it goes below 0
				// which is exactly what we want
				// this function will then be called a last time with the error as argument,
				// which we then can pass to the observer
				if (countLeft >= 0) {
					countLeft--;

					// we subscribe as usual
					currentSourceSubscription = source.subscribe(
						// we pass along any values to the observer
						v => observer.next(v),
						// as soon as we hit an error,
						// we call our helper function again passing the error along for later
						err => resubscribeIfNotDone(err),
						// if the source completes, we also complete this
						() => observer.complete()
					);
				} else {
					// at this point, we have already retried "count" many times
					observer.error(err);
				}
			}

			// as the first subscription won't happen by itself, we
			// call our helper to do this
			resubscribeIfNotDone(null);

			// return subscription, which will unsubscribe from inner observable
			return new Subscription(() => {
				console.log('unsubscribe');
				currentSourceSubscription.unsubscribe();
			});
		});
	};
}

// our example will throw, will retry but ultimately fail
of(1, 2, 3)
	.pipe(
		map(v => {
			if (v === 2) throw Error('what');
			else return v;
		})
	)
	.pipe(retry(2))
	.subscribe(
		v => {
			console.log('value: ', v);
		},
		err => {
			console.log('error: ', err);
		},
		() => {
			console.log('complete');
		}
	);
