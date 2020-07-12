## Intro

This guide is for the curious but foremost for people who have at least some basic understanding of rxjs observables and want to get more into operators.

These commented operators should provide you an easier to understand glimse into the code for observables that you can easily follow and introspect.
They should also help you build your own operators more easily.

The original operators implementations use mechanisms that are more performant, but we don't care about performance here.
Most of the times the original implementations will also will let you interchange observables with promises, but we only support observables to make it simpler to understand.

### What I learned while doing this

- You can only call error or complete once. You should make sure to only call one of them.
- Some operators are just sugar syntax built from others.
- Calling next() should be try-catched and properly handled. But more on this in "error handling"
- Your cleanup code

### Basic operator

A well written guide for custom operators is already in the docs,
but for completness sake I'll try my own explenation here so you may already get a sense of what
commented operators look like.

We will take a huge step back here and dismantle an operator and assemble it again step by step. The first step to writing your own operator is to provide a named function.

```js
function myOperator() {...}
```

Our operator can be applied to any observable via the pipe function.
If we have an observable via `from([a, b, c])` and apply our operator by using the pipe operation via `from([a, b, c]).pipe(myOperator())`
you may observe that we call our operator function to get a prestine instance of said operator.

To illustrate this we could also store it into some variable real quick.

```js
const myOperatorInstance = myOperator();
// using it via
from([a, b, c]).pipe(myOperatorInstance);
```

Although it is possible to reuse this instance, it is considered best practice to use a function to make sure that any used internal state is not beeing reused. Also often you want to pass some extra arguments to your operator `e.g. filter(x => x > 10)`.

Now to the part that we have to return when creating a new operator.
Within our operator function we need to return another function, which takes a source observable as an argument. This source observable is the uptream observable or in other words it is the datastream that is piped into your operator.

```js
// this example operator has no arguments
function myOperator() {

	// we'll call this inner function
	return function (sourceObservable) {
		// we need to subscribe to the source
		// observable at one point
		...
	};
}
```

This inner function should at one point subscribe to the source observable.
In our previous example as soon as we subscribe to the observable `from([a, b, c]).pipe(myOperator()).subscribe(v => console.log(v))`
our operator should interanlly subscribe to the upstream
(aka. observable before the operator is applied) which in our case would be `from([1, 2, 3])`.

```js
//
const exampleObservable = from([a, b, c]).pipe(myOperator());

// as soon as subscribe here
// our inner function will get `from([a, b, c]`
// passeed as argument, which we need to subscribe to
exampleObservable.subscribe(v => console.log(v));
```

Although we totaly could, we should not subscribe directly upon operator creation because doing so would make the observable **hot**. Let's also look at a quick example here:
Interval will give us an observable that counts from 0 every x milliseconds, where x is the argument.

```js
interval(1000).pipe(myHotOperator());
function myHotOperator() {
	return function (sourceObservable) {
		// WRONG: if we subscribe here directly like so this would make our observable hot, it would instantaniously start to consume the upstream observable
		sourceObservable.subscribe(x => {
			console.log('tick');
		});

		// SIDENOTE: as we need to return something that others can subscribe to
		// in this case we would need to instanciate a subject
		// and return that and call subject.next within the subscription above
		const subj = new Subject();
		sourceObservable.subscribe(x => {
			subj.next(x);
		});
		return subj;
	};
}

// we can use an operator that makes our observable hot
// an example would be the share() operator
let example = interval(1000).pipe(myHotOperator());

// if we subscribe after 3 seconds, the first number should
// be 3 alreday
setTimeout(() => {
	example.subscribe(x => console.log(x));
}, 3000);
```

Usually we do not want to detroy the observer principle, where
the whole chain is only setup when somebody subscribes at the end.

This inner function therefor rather needs to return a cold observable, which means one that no one has subscribed to yet. One way to do this, is to just apply some other operators on our sourceObservable and return something like: `sourceObservable.pipe(map(x => x * 2))` or `sourceObservable.pipe(tap(x => logValueToMyLoggingService(x)))`

Another, and probably the most common way (which all of our examples here will also do) is to create a new Observable and return that.

```js
// create a new observable and return that
return new Observable(observer => {
	// observer.next()
	// observer.error()
	// observer.complete()
});
```

So the operator with this looks like this:

```js
function myOperator() {
	return function (sourceObservable) {
		return new Observable(observer => {
			// observer.next()
			// observer.error()
			// observer.complete()
		});
	};
}
```

Within the newly created observable we will subscribe to the source observable,
so it will only be subscribed to the source observable, when the newly created
returned observable is subscribed to.

```js
function myOperator() {
	return function (sourceObservable) {
		return new Observable(observer => {
			// we only subscribe within the created observable,
			// which means it will only subscribe to the source observable
			// whenever someone else subscribes to the created observable
			sourceObservable.subscribe(sourceValue => {
				// maybe do some calculations with the source value
				// othewise just pass them through
				observer.next(sourceValue);
			});
		});
	};
}
```

We still need to take care about some stuff like errors and the source subscription.

```js
function myOperator() {
	return function (sourceObservable) {
		return new Observable(observer => {
			sourceObservable.subscribe(
				sourceValue => {
					observer.next(sourceValue);
				},
				// handle error from upstream source, by passing them on
				err => observer.error(err),
				// also handle complete event from source
				() => observer.complete()
			);
		});
	};
}
```

Next we also need to clean up our subscription so that we don't leak memory, after someone unsubscribes from our observable, that we created by our operator.

```js
function myOperator() {
	return function (sourceObservable) {
		return new Observable(observer => {
			// store the source subscription
			const sourceSubscription = sourceObservable.subscribe(
				sourceValue => {
					observer.next(sourceValue);
				},
				err => observer.error(err),
				() => observer.complete()
			);

			// return the source subscription or like in this case return a new subscription, which handler gets
			// called, as soon as one unsubscribes from this observable
			//
			// NOTE: this will also be called, when you call .error() or .complete()
			// but not if you throw an error in your next handler
			return new Subscription(() => {
				// in which we unsubscribe from our source
				sourceSubscription.unsubscribe();
			});
		});
	};
}
```

### Error handling

Now for completness sake we should also take a quick look at error handling.
Although rxjs handles a lot of the heavy lifting, we need to understand, that you
can call `.error` OR `.complete` only once. After that you should not call `.next` again (rxjs will have an internal `closed` flag and will not pass along any more messages you are trying to send with `.next`, but you also should try to avoid sending more).

Calling `.next()` (A) is basically calling either the value function of your subscriber (B) or of the subscriber in the next observable (C):

```js
// (A) by calling this next function in your observable
observer.next(value);

//...
myObservable.subscribe(
	// (B) you are calling this method in the subscriber directly and synchronously
	value => {
		// and this my throw
		throw new Error('because I can');
	},
	err => {},
	() => {}
);
```

So if you pass along the error and complete handlers of your source subscription
it would be good practice to try-catch your next calls and call .error and unsubscribe from the source.

```js
function myOperator() {
	return function (sourceObservable) {
		return new Observable(observer => {
			let sourceSubscription = sourceObservable.subscribe(
				// (C) or you may call the inner subscription value function of this operator.
				sourceValue => {
					try {
						// As this is calling (B) which in our example does throw
						observer.next(sourceValue);
					} catch (err) {
						observer.error(err);
						// at this point we should not call observer.next ever again
						// but using observer.error will call your unsubscribe method
						// where you need to unsubscribe from the source
					}
				},
				err => observer.error(err),
				() => observer.complete()
			);

			return new Subscription(() => {
				sourceSubscription.unsubscribe();
			});
		});
	};
}
```

Lukily rxjs handles this for us most of the time, so you may omit this but you should make sure you understand this.
Lets look at one more example:

```js
range(1, 10)
	.pipe(
		map(x => x + 1),
		myOperator()
	)
	.subscribe(
		value => {
			// Let's pretend an error is thrown here.
			throw new Error('ERROR THROWN');
		},
		err => {
			// see below, why this error will be catched in the map operator
			// and which will in most cases call unsubscribe to the source within the map operator
			//
			// Reference: Map operator
			// Here you can see that `this.destination.error(err);` is called in the try-catch block https://github.com/ReactiveX/rxjs/blob/6.5.5/src/internal/operators/map.ts#L86.
			// Which calls `this._error(err);` if not already stopped https://github.com/ReactiveX/rxjs/blob/6.5.5/src/internal/Subscriber.ts#L110
			// Which calls `this.unsubscribe();` https://github.com/ReactiveX/rxjs/blob/6.5.5/src/internal/Subscriber.ts#L142
		}
	);

function myOperator() {
	return function (sourceObservable) {
		return new Observable(observer => {
			const sourceSubscription = sourceObservable.subscribe(
				sourceValue => {
					// If this .next call throws like in our case, it throws synchronisly and will
					// not be catched here.

					// The map operator which looks quite similar, will wrap this .next() call in a try-catch-block
					// and will observer.error whenever the .next throws.
					observer.next(sourceValue);
				},
				// In this case the error will be passed through here
				// but could be catched and not passed along. If so, we would need
				// to either complete OR resubscribe to or replace the source observable
				err => observer.error(err),
				() => observer.complete()
			);

			return new Subscription(() => {
				sourceSubscription.unsubscribe();
			});
		});
	};
}
```
