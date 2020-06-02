/**
 * Pluck operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval } from 'rxjs';
import { logValue } from '../utils';
import { isArray } from 'util';

export function pluck<T, R>(...properties: string[]) {
	return (source: Observable<T>) => {
		const propertyList = isArray(properties[0]) ? properties[0] : properties;

		return new Observable<T>(observer => {
			const sourceSubscription = source.subscribe(
				value => {
					let result = value;
					for (const property of propertyList) {
						result = result[property];
					}
					observer.next(result);
				},
				observer.error,
				observer.complete
			);

			// return subscription, which will unsubscribe from inner observable
			return new Subscription(() => {
				sourceSubscription.unsubscribe();
			});
		});
	};
}

interval(100)
	.pipe(pluck('prop'))
	.subscribe(v => {
		logValue('value: ', v);
	});
