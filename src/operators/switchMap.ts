/**
 * Switch map operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, OperatorFunction, ObservableInput } from 'rxjs';
import { switchMap as switchMapOriginal } from 'rxjs/operators';

export function switchMap<T, O extends Observable<any>>(project: (value: T, index: number) => O) {
	return (source: Observable<T>) =>
		new Observable<T>(observer => {
			let innerSubscription: Subscription;
			let index = 0;
			const subscription = source.subscribe(
				value => {
					innerSubscription?.unsubscribe();
					const innerObservable = project(value, index++);
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
	.pipe(switchMapOriginal(v => of(1, 1, 1)))
	.subscribe(
		v => {
			console.log('value: ', v);
		},
		null,
		() => {
			console.log('=====');

			of(of(1, 2, 3), of(1, 2, 3))
				.pipe(switchMap(v => of(1, 1, 1)))
				.subscribe(
					v => {
						console.log('value: ', v);
					},
					null,
					() => {}
				);
		}
	);
