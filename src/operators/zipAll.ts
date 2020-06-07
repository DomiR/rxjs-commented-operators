/**
 * Zip app operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval } from 'rxjs';
import { logValue } from '../utils';
import { delay } from 'rxjs/operators';
import { zipAll as zipAllOriginal } from 'rxjs/operators';

export function zipAll<T>(project: (...values: any[]) => any = (...v) => v) {
	return (source: Observable<T>) =>
		new Observable<T[]>(observer => {
			const buffers: T[][] = [];
			const subscriptions: Subscription[] = [];
			const didComplete: boolean[] = [];
			let didSourceComplete = false;
			let index = 0;

			function handleAllComplete() {
				subscriptions.forEach(s => s.unsubscribe());
				while (buffers.every(buff => buff.length > 0)) {
					const vals = [];
					buffers.forEach(buffer => vals.push(buffer.shift()));
					const projectedValue = project(...vals);
					observer.next(projectedValue);
				}
				observer.complete();
			}

			const sourceSubscription = source.subscribe(
				(value: any) => {
					const buffer: T[] = [];
					buffers.push(buffer);
					didComplete.push(false);
					let idx = index++;
					const newSubscription = value.subscribe(
						v => {
							buffer.push(v);
						},
						err => {},
						() => {
							didComplete[idx] = true;
							if (didSourceComplete) {
								handleAllComplete();
							}
						}
					);
					subscriptions.push(newSubscription);
				},
				observer.error,
				() => {
					didSourceComplete = true;
					if (didComplete.every(v => v)) {
						handleAllComplete();
					}
				}
			);

			return new Subscription(() => {
				subscriptions.forEach(s => s.unsubscribe());
				sourceSubscription.unsubscribe();
			});
		});
}

of(of(1, 2, 3), of(4, 5, 6, 7), of(8, 9, 10).pipe(delay(1000)))
	.pipe(zipAll())
	.subscribe(v => {
		logValue('value: ', v);
	});
