/**
 * Is empty operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription } from 'rxjs';
import { isEmpty as isEmptyOriginal } from 'rxjs/operators';

export function isEmpty() {
	return (source: Observable<any>) =>
		new Observable<any>(observer => {
			const subscription = source.subscribe(
				value => {
					observer.next(false);
					observer.complete();
				},
				err => {
					observer.error(err);
				},
				() => {
					observer.next(true);
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
	.pipe(isEmpty())
	.subscribe(v => {
		console.log('value: ', v);
	});
