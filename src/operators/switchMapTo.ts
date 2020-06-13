/**
 * Switch map to operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, OperatorFunction, ObservableInput } from 'rxjs';
import { switchMapTo as switchMapToOriginal } from 'rxjs/operators';

export function switchMapTo<T, O extends Observable<any>>(innerObservable: any) {
	return (source: Observable<T>) =>
		new Observable<T>(observer => {
			let innerSubscription: Subscription;
			let index = 0;
			const subscription = source.subscribe(
				value => {
					innerSubscription?.unsubscribe();
					innerSubscription = innerObservable.subscribe(
						v => observer.next(v),
						err => observer.error(err),
						() => {}
					);
				},
				err => observer.error(err),
				() => observer.complete()
			);

			// return subscription, which will
			return new Subscription(() => {
				innerSubscription?.unsubscribe();
				subscription.unsubscribe();
			});
		});
}

of(of(1, 2, 3), of(1, 2, 3))
	.pipe(switchMapToOriginal(of(1, 1, 1)))
	.subscribe(
		v => {
			console.log('value: ', v);
		},
		null,
		() => {
			console.log('=====');

			of(of(1, 2, 3), of(1, 2, 3))
				.pipe(switchMapTo(of(1, 1, 1)))
				.subscribe(
					v => {
						console.log('value: ', v);
					},
					null,
					() => {}
				);
		}
	);
