/**
 * ignore elements operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription } from 'rxjs';

export function ignoreElements() {
	return (source: Observable<any>) =>
		new Observable<any>(observer => {
			const subscription = source.subscribe(
				value => {},
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
	.pipe(ignoreElements())
	.subscribe(v => {
		console.log('value: ', v);
	});
