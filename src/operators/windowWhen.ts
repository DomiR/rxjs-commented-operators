/**
 * Window when operator
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { Observable, of, Subscription, timer, interval, Subject } from 'rxjs';

import { windowWhen as windowWhenOriginal, take } from 'rxjs/operators';

export function windowWhen<T>(closingSelector: () => Observable<any>) {
	return (source: Observable<T>) =>
		new Observable<Subject<T>>(observer => {
			let windowSubject: Subject<T> = null;
			let closingSubscription: Subscription;

			function subscribeToClosingObservable() {
				const closingObservable = closingSelector();
				closingSubscription = closingObservable.subscribe(() => {
					console.debug('closing now');
					// Emit buffer, then reset it whenever the closing Observable emits a value
					windowSubject?.complete();
					windowSubject = null;
					subscribeToClosingObservable();
				});
			}
			subscribeToClosingObservable();

			const sourceSubscription = source.subscribe(
				value => {
					console.log('source value: ', value);

					if (windowSubject == null) {
						windowSubject = new Subject();
						observer.next(windowSubject);
						windowSubject.next(value);
					} else {
						windowSubject.next(value);
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
				closingSubscription?.unsubscribe();
			});
		});
}

let index = 0;
interval(100)
	.pipe(take(10))
	.pipe(
		windowWhenOriginal(() => {
			console.debug('closing selection');
			return timer(950);
		})
	)
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
				.pipe(
					windowWhen(() => {
						console.debug('closing selection');
						return timer(950);
					})
				)
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
