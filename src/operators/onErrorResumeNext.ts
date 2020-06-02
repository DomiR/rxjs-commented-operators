/**
 * On error resume next operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval } from 'rxjs';
import { logValue } from '../utils';
import { isArray } from 'util';

export function onErrorResumeNext<T, R>(...nextSources: any[]) {
	return (source: Observable<T>) => {
		const nextSourceList = isArray(nextSources[0]) ? nextSources[0] : nextSources;
		nextSourceList.unshift(source);

		return new Observable<T>(observer => {
			let sourceSubscription: Subscription;
			function subscribeToNext(err) {
				if (nextSourceList.length === 0) {
					observer.error(err);
				}
				const nextSource = nextSourceList.shift();
				sourceSubscription = nextSource.subscribe(
					observer.next,
					err => {
						subscribeToNext(err);
					},
					observer.complete
				);
			}

			subscribeToNext(null);

			// return subscription, which will unsubscribe from inner observable
			return new Subscription(() => {
				sourceSubscription.unsubscribe();
			});
		});
	};
}

interval(100)
	.pipe(onErrorResumeNext(of(1, 2, 3)))
	.subscribe(v => {
		logValue('value: ', v);
	});
