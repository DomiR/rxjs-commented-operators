/**
 * Switch all operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, OperatorFunction, ObservableInput } from 'rxjs';

export function switchAll<T>() {
	return (source: Observable<Observable<T>>) =>
		new Observable<T>(observer => {
			let innerSubscription: Subscription;
			const subscription = source.subscribe(
				value => {
					innerSubscription?.unsubscribe();
					innerSubscription = value.subscribe(observer.next, observer.error, observer.complete);
				},
				observer.error,
				observer.complete
			);

			// return subscription, which will
			return new Subscription(() => {
				innerSubscription?.unsubscribe();
				subscription.unsubscribe();
			});
		});
}

of(of(1, 2, 3), of(1, 2, 3))
	.pipe(switchAll())
	.subscribe(v => {
		console.log('value: ', v);
	});
