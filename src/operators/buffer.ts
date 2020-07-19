/**
 * Buffer operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval } from 'rxjs';

import { buffer as bufferOriginal, take } from 'rxjs/operators';

export function buffer<T, U>(closingNotifier: Observable<U>) {
	return (source: Observable<T>) =>
		new Observable<U[]>(observer => {
			let buffer = [];

			const sourceSubscription = source.subscribe(
				value => {
					console.log('source value: ', value);
					buffer.push(value);
				},
				err => {
					console.log('source err: ', err);
					observer.error(err);
				},
				() => {
					console.log('source complete');
					observer.complete();
				}
			);

			const closingNotifierSubscription = closingNotifier.subscribe(
				value => {
					console.log('closingNotifier: ', value);
					observer.next(buffer);
				},
				err => {
					console.log('closingNotifier err: ', err);
				},
				() => {
					console.log('closingNotifier complete');
					observer.complete();
				}
			);

			// return subscription, which will unsubscribe from inner observable
			return new Subscription(() => {
				sourceSubscription.unsubscribe();
				closingNotifierSubscription.unsubscribe();
			});
		});
}

interval(100)
	.pipe(take(5), buffer(timer(500)))
	.subscribe(v => {
		console.log('value: ', v);
	});
