/**
 * bufferTime operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */
import { fromEvent, EMPTY } from 'rxjs';

import { Observable, of, Subscription, timer, interval } from 'rxjs';
import { logValue } from '../utils';

export function bufferCount<T, O>(
	openings: Observable<O>,
	closingSelector: (value: O) => Observable<any>
) {
	return (source: Observable<T>) =>
		new Observable<T[]>(observer => {
			let buffer: T[] = [];
			let bufferTimeSpanInterval;

			const openingsSubscription = openings.subscribe(value => {
				// As soon as we get our opening value, we pass it to the closing selector
			});

			const sourceSubscription = source.subscribe(
				value => {
					logValue('source value: ', value);
					// We store our value in every buffer we currently have open
					buffer.push(value);
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
				clearInterval(bufferTimeSpanInterval);
			});
		});
}

interval(500)
	.pipe(bufferCount(1000))
	.subscribe(v => {
		logValue('value: ', v);
	});
