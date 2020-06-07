/**
 * Concat all operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { logValue } from '../utils';
import { concatAll as concatAllOriginal } from 'rxjs/operators';

export function concatAll<T>() {
	return (source: Observable<T>) =>
		new Observable<any>(observer => {
			const combinedSubscription = new Subscription();
			const innerObservables = [];
			let activeSubscription = null;

			function subscribeToNextInner() {
				if (
					innerObservables.length > 0 &&
					(activeSubscription == null || activeSubscription.closed)
				) {
					const nextInnerObservable = innerObservables.shift();

					activeSubscription = nextInnerObservable.subscribe(
						value => {
							observer.next(value);
						},
						err => {
							observer.error(err);
						},
						() => {
							activeSubscription = null;
							subscribeToNextInner();
						}
					);
				}
			}

			const sourceSubscription = source.subscribe(
				value => {
					logValue('source value: ', value);
					innerObservables.push(value);
					subscribeToNextInner();
				},
				err => {
					logValue('source err: ', err);
					observer.error(err);
				},
				() => {
					logValue('source complete');
					if (activeSubscription == null && innerObservables.length == 0) {
						observer.complete();
					}
				}
			);
			combinedSubscription.add(sourceSubscription).add(() => {
				activeSubscription?.unsubscribe();
			});
			return combinedSubscription;
		});
}

of(of('a', 'b', 'c'), of('a', 'b', 'c'), of('a', 'b', 'c'))
	.pipe(concatAll())
	.subscribe(x => console.log(x));
