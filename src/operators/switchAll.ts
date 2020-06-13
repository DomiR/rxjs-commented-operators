/**
 * Switch all operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, OperatorFunction, ObservableInput } from 'rxjs';
import { switchAll as switchAllOriginal } from 'rxjs/operators';
import { logValue } from '../utils';

export function switchAll<T>() {
	return (source: Observable<Observable<T>>) =>
		new Observable<T>(observer => {
			let innerSubscription: Subscription;
			const subscription = source.subscribe(
				value => {
					logValue('source value: ', value);
					innerSubscription?.unsubscribe();
					innerSubscription = value.subscribe(
						v => observer.next(v),
						err => observer.error(err),
						() => {}
					);
				},
				err => {
					logValue('source err: ', err);
					observer.error(err);
				},
				() => {
					logValue('source complete');
					observer.complete();
				}
			);

			// return subscription, which will
			return new Subscription(() => {
				innerSubscription?.unsubscribe();
				subscription.unsubscribe();
			});
		});
}

of(of(1, 2, 3), of(1, 2, 3))
	.pipe(switchAllOriginal())
	.subscribe(
		v => {
			console.log('value: ', v);
		},
		null,
		() => {
			console.log('=====');

			of(of(1, 2, 3), of(1, 2, 3))
				.pipe(switchAll())
				.subscribe(
					v => {
						console.log('value: ', v);
					},
					null,
					() => {}
				);
		}
	);
