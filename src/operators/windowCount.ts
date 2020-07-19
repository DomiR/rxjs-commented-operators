/**
 * Window count operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval, Subject } from 'rxjs';

import { windowCount as windowCountOriginal, take } from 'rxjs/operators';

export function windowCount<T>(bufferSize: number, startBufferEvery: number = null) {
	return (source: Observable<T>) =>
		new Observable<Subject<T>>(observer => {
			let bufferList: { count: number; subject: Subject<T> }[] = [];
			let count = 0;
			let windowCount = 0;
			let windowSubject = new Subject<T>();

			const sourceSubscription = source.subscribe(
				value => {
					console.log('source value: ', value);

					if (startBufferEvery != null) {
						if (count % startBufferEvery === 0) {
							const subject = new Subject<T>();
							bufferList.push({ count: 0, subject });
							observer.next(subject);
						}

						const bufferListReverse = bufferList.reverse();
						for (let i = bufferList.length - 1; i >= 0; i--) {
							const buffer = bufferListReverse[i];
							buffer.subject.next(value);
							buffer.count++;
							const reverseIdx = bufferList.length - i;
							if (buffer.count === bufferSize) {
								bufferList.splice(reverseIdx, 1);
							}
						}
						count += 1;
					} else {
						windowSubject.next(value);
						windowCount++;
						if (windowCount === bufferSize) {
							windowSubject.complete();
							windowSubject = new Subject<T>();
							observer.next(windowSubject);
							windowCount = 0;
						}
					}
				},
				err => {
					console.log('source err: ', err);
					observer.error(err);
				},
				() => {
					console.log('source complete');
					observer.complete();
				}
			);

			// return subscription, which will unsubscribe from inner observable
			return new Subscription(() => {
				sourceSubscription.unsubscribe();
			});
		});
}

let index = 0;
interval(100)
	.pipe(take(10))
	.pipe(windowCountOriginal(3, 2))
	.subscribe(
		v => {
			let obsIndex = index++;
			v.subscribe(x => {
				console.log('value: ', x, ' from: ', obsIndex);
			});
		},
		null,
		() => {
			console.log('=====');
			index = 0;
			interval(100)
				.pipe(take(10))
				.pipe(windowCount(3, 2))
				.subscribe(
					v => {
						let obsIndex = index++;
						v.subscribe(x => {
							console.log('value: ', x, ' from: ', obsIndex);
						});
					},
					null,
					() => {
						console.log('=====');
					}
				);
		}
	);
