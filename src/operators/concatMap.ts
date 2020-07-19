/**
 * Concat map operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval, from } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { concatMap as concatMapOriginal } from 'rxjs/operators';

export function concatMap<T, O>(project: (value: T, index: number) => O) {
	return (source: Observable<T>) =>
		new Observable<any>(observer => {
			const innerObservables = [];
			let activeSubscription = null;
			let index = 0;
			function subscribeToNextInner() {
				if (
					innerObservables.length > 0 &&
					(activeSubscription == null || activeSubscription.closed)
				) {
					const nextInnerObservable = innerObservables.shift();
					activeSubscription = nextInnerObservable.subscribe(
						value => {
							console.log('inner value: ', value);
							observer.next(value);
						},
						err => {
							console.log('inner error: ', err);
							observer.error(err);
						},
						() => {
							console.log('inner complete: ');
							activeSubscription = null;
							subscribeToNextInner();
						}
					);
				}
			}

			const sourceSubscription = source.subscribe(
				value => {
					console.log('source value: ', value);
					// get projected value
					const observer = project(value, (index += 1));
					innerObservables.push(observer);
					subscribeToNextInner();
				},
				err => {
					console.log('source err: ', err);
					observer.error(err);
				},
				() => {
					console.log('source complete');
					if (activeSubscription == null && innerObservables.length == 0) {
						observer.complete();
					}
				}
			);

			return new Subscription(() => {
				sourceSubscription.unsubscribe();
				activeSubscription?.unsubscribe();
				console.debug('unsubscribe');
			});
		});
}

of('a', 'b', 'c')
	.pipe(
		concatMap((v, i) => {
			return interval(1000).pipe(take(2));
		})
	)
	.subscribe(x => console.log(x));
