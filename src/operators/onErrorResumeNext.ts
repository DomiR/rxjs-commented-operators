/**
 * On error resume next operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval } from 'rxjs';

import { isArray } from 'util';
import { onErrorResumeNext as onErrorResumeNextOriginal, map } from 'rxjs/operators';

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
					v => observer.next(v),
					err => {
						subscribeToNext(err);
					},
					() => observer.complete()
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

of(1, 2, 3)
	.pipe(
		map(v => {
			if (v === 2) throw Error('what');
			else return v;
		})
	)
	.pipe(onErrorResumeNextOriginal(of(1, 2, 3)))
	.subscribe(
		v => {
			console.log('value: ', v);
		},
		null,
		() => {
			console.log('====');

			of(1, 2, 3)
				.pipe(
					map(v => {
						if (v === 2) throw Error('what');
						else return v;
					})
				)
				.pipe(onErrorResumeNext(of(1, 2, 3)))
				.subscribe(v => {
					console.log('value: ', v);
				});
		}
	);
