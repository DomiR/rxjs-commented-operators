/**
 * Buffer toggle operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */
import { fromEvent, EMPTY } from 'rxjs';

import { Observable, of, Subscription, timer, interval } from 'rxjs';
import { logValue } from '../utils';
import { bufferToggle as bufferToggleOriginal, take, tap } from 'rxjs/operators';

interface Context<T> {
	subscription: Subscription;
	buffer: T[];
}

export function bufferToggle<T, O>(
	openings: Observable<O>,
	closingSelector: (value: O) => Observable<any>
) {
	return (source: Observable<T>) =>
		new Observable<T[]>(observer => {
			let contexts: Context<T>[] = [];

			// We subscribe to the opening observable
			const openingSubscription = openings.subscribe(
				openingValue => {
					// Every time we get a value here, we build a closing observable
					// Note: Rxjs also supports promises here, we could check if it is one and use `from`
					const closingObservable = closingSelector(openingValue);

					// We open a new context here, which includes the buffer and the closing subscription
					const buffer = [];
					const context = {
						buffer: buffer,
						subscription: closingObservable.subscribe(() => {
							// As soon as our closing observable emits, we
							// emit the buffer from this context and remove it from
							// our contexts list.
							observer.next(buffer);
							const idx = contexts.indexOf(context);
							contexts.splice(idx, 1);
						}),
					};
					contexts.push(context);
				},
				err => {},
				() => {}
			);
			const sourceSubscription = source.subscribe(
				value => {
					logValue('source value: ', value);
					// We store our value in every buffer we currently have open
					for (const context of contexts) {
						context.buffer.push(value);
					}
					// We also subscribe to the closingObervable
				},
				err => {
					logValue('source err: ', err);
					observer.error(err);
				},
				() => {
					logValue('source complete');
					for (const context of contexts) {
						context.subscription.unsubscribe();
						observer.next(context.buffer);
					}
					observer.complete();
				}
			);

			// Return subscription, which will unsubscribe from inner observable
			return new Subscription(() => {
				sourceSubscription.unsubscribe();

				// We also need to unsubscribe from the openings
				openingSubscription?.unsubscribe();

				// All contexts need to be closed
				// TODO: and we emit the outstanding buffers??? probably not

				for (const context of contexts) {
					context.subscription.unsubscribe();
					observer.next(context.buffer);
				}
			});
		});
}

interval(100)
	.pipe(
		take(5),
		bufferToggle(interval(160), v => timer(200))
	)
	.subscribe(v => {
		logValue('value: ', v);
	});
