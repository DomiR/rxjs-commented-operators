/**
 * Tap operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval, range } from 'rxjs';
import { logValue } from '../utils';
import { tap as tapOriginal } from 'rxjs/operators';

export function tap<T>(cb: (value: T) => void) {
	return (source: Observable<T>) =>
		new Observable<T>(observer => {
			const sourceSubscription = source.subscribe(
				value => {
					// We just call the print callback and procede as normal
					cb(value);
					observer.next(value);
				},
				observer.error,
				() => {
					console.debug('souce complete');
					observer.complete();
				}
			);

			// return subscription, which will unsubscribe from inner observable
			return new Subscription(() => {
				console.debug('clean up');
				sourceSubscription.unsubscribe();
			});
		});
}

range(1, 10)
	.pipe(
		tapOriginal(v => {
			console.log('tapped value', v);
		})
	)
	.subscribe(v => {
		logValue('value: ', v);
	});
