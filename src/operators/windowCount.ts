/**
 * Buffer count operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval, Subject } from 'rxjs';
import { logValue } from '../utils';

export function windowCount<T>(bufferSize: number, startBufferEvery: number = null) {
	return (source: Observable<T>) =>
		new Observable<Subject<T>>(observer => {
			let bufferList: { count: number; subject: Subject<T> }[] = [];
			let count = 0;
			let windowCount = 0;
			let windowSubject = new Subject<T>();

			const sourceSubscription = source.subscribe(
				value => {
					logValue('source value: ', value);

					if (startBufferEvery != null) {
						count += 1;

						if (count % startBufferEvery) {
							const subject = new Subject<T>();
							bufferList.push({ count: 0, subject });
							observer.next(subject);
						}

						for (const buffer of bufferList) {
							buffer.subject.next(value);
							buffer.count++;
							if (buffer.count === bufferSize) {
								bufferList.slice(bufferList.indexOf(buffer), 1);
							}
						}
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
					logValue('source err: ', err);
					observer.error(err);
				},
				() => {
					logValue('source complete');
					observer.complete();
				}
			);

			// return subscription, which will unsubscribe from inner observable
			return new Subscription(() => {
				sourceSubscription.unsubscribe();
			});
		});
}

interval(500)
	.pipe(windowCount(3, 2))
	.subscribe(v => {
		logValue('value: ', v);
	});
