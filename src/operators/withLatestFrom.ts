/**
 * audit operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval } from 'rxjs';
import { logValue } from '../utils';

export function withLatestFrom<T, R>(...args: any[]) {
	return (source: Observable<T>) =>
		new Observable<T>(observer => {
			const project = args.slice(-1)[0];
			const hasProjectFunction = typeof project === 'function';
			const latestObservables = hasProjectFunction ? args.slice(0, -1) : args;
			const latestValues = latestObservables.map(l => undefined);
			let hasAllLatestValues = false;

			// const latestValues =
			const sourceSubscription = source.subscribe(
				value => {
					// We just call the print callback and procede as normal
					if (hasAllLatestValues) {
						const mappedValue = hasProjectFunction
							? project(...[value, ...latestValues])
							: [value, ...latestValues];
						observer.next(mappedValue);
					}
				},
				observer.error,
				observer.complete
			);

			for (let i = 0; i < latestObservables.length; i++) {
				const obs = latestObservables[i];
				// subscribe to obs
				const sub = obs.subscribe(value => {
					latestValues[i] = value;
					if (!hasAllLatestValues) {
						hasAllLatestValues = latestValues.every(v => v != undefined);
					}
				});
				sourceSubscription.add(sub);
			}

			// return subscription, which will unsubscribe from inner observable
			return new Subscription(() => {
				sourceSubscription.unsubscribe();
			});
		});
}

interval(100)
	.pipe(
		withLatestFrom(v => {
			console.log('tapped value', v);
		})
	)
	.subscribe(v => {
		logValue('value: ', v);
	});
