/**
 * Group by operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subject, Subscription } from 'rxjs';
import { groupBy as groupByOriginal, map, mergeAll } from 'rxjs/operators';

export function groupBy<T, K, R>(
	keySelector: (value: T) => K,
	elementSelector: (value: T) => R = v => v as any,
	durationSelector?: (grouped: Observable<R>) => Observable<any>,
	subjectSelector: () => Subject<R> = () => new Subject()
): any {
	return (source: Observable<T>) =>
		new Observable<Subject<R>>(observer => {
			const groupMap = new Map<K, Subject<R>>();
			const subscription = source.subscribe(
				value => {
					console.log('source value: ', value);
					const key = keySelector(value);
					const val = elementSelector(value);

					// get existing subject if applicable
					if (groupMap.has(key)) {
						const subject = groupMap.get(key);
						if (!subject.isStopped) {
							subject.next(val);
						}
					} else {
						const subject = subjectSelector();
						groupMap.set(key, subject);

						// at this point we also start our duraton selector if available
						if (durationSelector) {
							const durationSubscription = durationSelector(subject).subscribe(() => {
								subject.complete();

								// TODO: check if we really delete subject here, because it will recreate a new one
								groupMap.delete(key);
							});
							subscription.add(durationSubscription);
						}
						observer.next(subject);
						subject.next(val);
					}
				},
				err => {
					console.log('source err: ', err);
					observer.error(err);
				},
				() => {
					console.log('source complete');
					for (const [key, subj] of groupMap.entries()) {
						subj.complete();
					}
					observer.complete();
				}
			);

			// return subscription, which will
			return new Subscription(() => {
				for (const [key, subj] of groupMap.entries()) {
					subj.unsubscribe();
				}
				subscription.unsubscribe();
			});
		});
}

of(1, 2, 2, 3)
	.pipe(
		groupByOriginal(v => v),
		map((v: any, i) => v.pipe(map(v => ({ group: i, value: v })))),
		mergeAll()
	)
	.subscribe(
		v => {
			console.log('value: ', v);
		},
		null,
		() => {
			console.debug('=====');
			of(1, 2, 2, 3)
				.pipe(
					groupBy(v => v),
					map((v: any, i) => v.pipe(map(v => ({ group: i, value: v })))),
					mergeAll()
				)
				.subscribe(v => {
					console.log('value: ', v);
				});
		}
	);
