/**
 * Count operator
 *
 * @see
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval } from 'rxjs';
import { take } from 'rxjs/operators';

// count will get passed a predicate funciton
// that will determine wheter a value is counted or not
// if no funciton is passed, all values will be counted
export function count<T>(predicate?: (value: T, index: number, source: Observable<T>) => boolean) {
	// as always we need to return a function
	// that get's the source observable passed in
	return (source: Observable<T>) =>
		// we then return a new observable factory,
		// which internally needs to subscribe to the source observable
		new Observable<number>(observer => {
			// we store the current count in an internal state variable
			let count = 0;
			// because the predicate function get's called with an index,
			// we also need to store it in an internal state variable
			let index = 0;

			// we subscribe to the source observable as we usuually do.
			// If we have a predicate function we apply it making it act like a filter
			// The actual implementation calls uses the filter operator here.
			const sourceSubscription = source.subscribe(
				value => {
					console.log('source value: ', value);
					try {
						// we increment the counter for every value.
						// But if a predicate function is available, it needs to pass that first.
						if (typeof predicate != 'function' || predicate(value, index, source)) {
							count += 1;
						}

						// the next predicate call will need the next index
						index += 1;
					} catch (err) {
						// If the predicate function throws an error,
						// we pass the error down the observer chain.
						observer.error(err);
					}
				},
				// we pass along erros
				err => {
					console.log('source err: ', err);
					observer.error(err);
				},
				() => {
					console.log('source complete');

					// as soon as our source closes we
					// next the current count value.
					observer.next(count);
					observer.complete();
				}
			);

			// we return the subscription, which will unsubscribe from
			// inner observable in case the outer subscriber decides to
			// unsubscribe.
			return new Subscription(() => {
				sourceSubscription.unsubscribe();
			});
		});
}

// our example will take 5 elements from an interval and count them accordingly
interval(500)
	.pipe(take(5), count())
	.subscribe(v => {
		console.log('value: ', v);
	});
