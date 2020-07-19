/**
 * Retry operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { empty, Observable, of, Subscription } from 'rxjs';
import { catchError, map, retry as retryOriginal } from 'rxjs/operators';

export function retry<T, R>(count: number = -1) {
	return (source: Observable<T>) => {
		return new Observable<T | R>(observer => {
			let sourceSubscription: Subscription;
			let countLeft = count;
			function resubscribeIfNotDone(err) {
				if (countLeft >= 0) {
					countLeft--;
					sourceSubscription = source.subscribe(
						v => observer.next(v),
						err => resubscribeIfNotDone(err),
						() => observer.complete()
					);
				} else {
					observer.error(err);
				}
			}

			resubscribeIfNotDone(null);

			// return subscription, which will unsubscribe from inner observable
			return new Subscription(() => {
				console.log('unsubscribe');
			});
		});
	};
}

of(1, 2, 3)
	.pipe(
		map(v => {
			if (v === 2) throw Error('what');
			else return v;
		})
	)
	.pipe(
		retryOriginal(2),
		catchError(e => empty())
	)
	.subscribe(
		v => {
			console.log('value: ', v);
		},
		null,
		() => {
			console.log('=====');
			of(1, 2, 3)
				.pipe(
					map(v => {
						if (v === 2) throw Error('what');
						else return v;
					})
				)
				.pipe(
					retry(2),
					catchError(e => empty())
				)
				.subscribe(
					v => {
						console.log('value: ', v);
					},
					null,
					() => {
						console.log('complete');
					}
				);
		}
	);
