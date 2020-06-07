/**
 * Map to operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, OperatorFunction } from 'rxjs';
import { mapTo as mapToOriginal } from 'rxjs/operators';

export function mapTo<T, R>(mapValue: R): OperatorFunction<T, R> {
	return (source: Observable<T>) =>
		new Observable<R>(observer => {
			const subscription = source.subscribe(
				_ => {
					observer.next(mapValue);
				},
				err => {
					observer.error(err);
				},
				() => {
					observer.complete();
				}
			);

			// return subscription, which will
			return new Subscription(() => {
				subscription.unsubscribe();
			});
		});
}

of(1, 2, 3)
	.pipe(mapTo('a'))
	.subscribe(v => {
		console.log('value: ', v);
	});
