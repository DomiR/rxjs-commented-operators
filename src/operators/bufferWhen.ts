/**
 * bufferTime operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval } from 'rxjs';
import { logValue } from '../utils';

export function bufferWhen<T>(closingSelector: () => Observable<any>) {
	return (source: Observable<T>) =>
		new Observable<T[]>(observer => {
			let buffer: T[] = null;
			let closingSubscription: Subscription;

			const sourceSubscription = source.subscribe(
				value => {
					logValue('source value: ', value);

					if (buffer == null) {
						buffer = [value];
						const closingObservable = closingSelector();
						closingSubscription = closingObservable.subscribe(() => {
							// Emit buffer, then reset it whenever the closing Observable emits a value
							observer.next(buffer);
							buffer = [];
						});
					} else {
						buffer.push(value);
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
				closingSubscription?.unsubscribe();
			});
		});
}

interval(500)
	.pipe(bufferWhen(() => interval(1000)))
	.subscribe(v => {
		logValue('value: ', v);
	});
