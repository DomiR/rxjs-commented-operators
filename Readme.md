![Cover image](./cover.png)

This is a gentle introduction of [rxjs](https://rxjs-dev.firebaseapp.com/) operators.

If you need a refresher and/or a general introduction on operators and a first taste on what commented operators will look like [see here].

Otherwise please dig into the operators.

## <sub>Operators</sub>

- [x] audit ([source](https://rxjs-dev.firebaseapp.com/api/operators/audit))
- [x] auditTime ([source](https://rxjs-dev.firebaseapp.com/api/operators/auditTime))
- [x] buffer ([source](https://rxjs-dev.firebaseapp.com/api/operators/buffer))
- [x] bufferCount ([source](https://rxjs-dev.firebaseapp.com/api/operators/bufferCount))
- [x] bufferTime ([source](https://rxjs-dev.firebaseapp.com/api/operators/bufferTime))
- [x] bufferToggle ([source](https://rxjs-dev.firebaseapp.com/api/operators/bufferToggle))
- [x] bufferWhen ([source](https://rxjs-dev.firebaseapp.com/api/operators/bufferWhen))
- [x] catchError ([source](https://rxjs-dev.firebaseapp.com/api/operators/catchError))
- [x] combineAll ([source](https://rxjs-dev.firebaseapp.com/api/operators/combineAll))
- [x] concatAll ([source](https://rxjs-dev.firebaseapp.com/api/operators/concatAll))
- [x] concatMap ([source](https://rxjs-dev.firebaseapp.com/api/operators/concatMap))
- [x] concatMapTo ([source](https://rxjs-dev.firebaseapp.com/api/operators/concatMapTo))
- [x] count ([source](https://rxjs-dev.firebaseapp.com/api/operators/count))
- [x] debounce ([source](https://rxjs-dev.firebaseapp.com/api/operators/debounce))
- [x] debounceTime ([source](https://rxjs-dev.firebaseapp.com/api/operators/debounceTime))
- [x] defaultIfEmpty ([source](https://rxjs-dev.firebaseapp.com/api/operators/defaultIfEmpty))
- [x] delay ([source](https://rxjs-dev.firebaseapp.com/api/operators/delay))
- [x] delayWhen ([source](https://rxjs-dev.firebaseapp.com/api/operators/delayWhen))
- [x] distinct ([source](https://rxjs-dev.firebaseapp.com/api/operators/distinct))
- [x] distinctUntilChanged ([source](https://rxjs-dev.firebaseapp.com/api/operators/distinctUntilChanged))
- [x] distinctUntilKeyChanged ([source](https://rxjs-dev.firebaseapp.com/api/operators/distinctUntilKeyChanged))
- [x] elementAt ([source](https://rxjs-dev.firebaseapp.com/api/operators/elementAt))
- [x] endWith ([source](https://rxjs-dev.firebaseapp.com/api/operators/endWith))
- [x] every ([source](https://rxjs-dev.firebaseapp.com/api/operators/every))
- [x] exhaust ([source](https://rxjs-dev.firebaseapp.com/api/operators/exhaust))
- [x] exhaustMap ([source](https://rxjs-dev.firebaseapp.com/api/operators/exhaustMap))
- [x] expand ([source](https://rxjs-dev.firebaseapp.com/api/operators/expand))
- [x] filter ([source](https://rxjs-dev.firebaseapp.com/api/operators/filter))
- [x] finalize ([source](https://rxjs-dev.firebaseapp.com/api/operators/finalize))
- [x] find ([source](https://rxjs-dev.firebaseapp.com/api/operators/find))
- [x] findIndex ([source](https://rxjs-dev.firebaseapp.com/api/operators/findIndex))
- [x] first ([source](https://rxjs-dev.firebaseapp.com/api/operators/first))
- [ ] flatMap => alias for mergeMap
- [x] groupBy ([source](https://rxjs-dev.firebaseapp.com/api/operators/groupBy))
- [x] ignoreElements ([source](https://rxjs-dev.firebaseapp.com/api/operators/ignoreElements))
- [x] isEmpty ([source](https://rxjs-dev.firebaseapp.com/api/operators/isEmpty))
- [x] last ([source](https://rxjs-dev.firebaseapp.com/api/operators/last))
- [x] map ([source](https://rxjs-dev.firebaseapp.com/api/operators/map))
- [x] mapTo ([source](https://rxjs-dev.firebaseapp.com/api/operators/mapTo))
- [ ] materialize => notifications
- [x] max ([source](https://rxjs-dev.firebaseapp.com/api/operators/max))
- [x] mergeAll ([source](https://rxjs-dev.firebaseapp.com/api/operators/mergeAll))
- [x] mergeMap ([source](https://rxjs-dev.firebaseapp.com/api/operators/mergeMap))
- [x] mergeMapTo ([source](https://rxjs-dev.firebaseapp.com/api/operators/mergeMapTo))
- [x] mergeScan ([source](https://rxjs-dev.firebaseapp.com/api/operators/mergeScan))
- [x] min ([source](https://rxjs-dev.firebaseapp.com/api/operators/min))
- [ ] multicast => map to a subject, so more subscribers can subscribe to this while internaly using one subscription only
- [ ] observeOn => replace scheduler
- [x] onErrorResumeNext ([source](https://rxjs-dev.firebaseapp.com/api/operators/onErrorResumeNext))
- [x] pairwise ([source](https://rxjs-dev.firebaseapp.com/api/operators/pairwise))
- [x] pluck ([source](https://rxjs-dev.firebaseapp.com/api/operators/pluck))
- [ ] publish => map to connectable observable
- [ ] publishBehavior => map to behaviour subject
- [ ] publishLast => map to
- [ ] publishReplay => map to replay subject
- [x] reduce ([source](https://rxjs-dev.firebaseapp.com/api/operators/reduce))
- [ ] refCount => map to ConnectableObservable while counting refs
- [x] repeat ([source](https://rxjs-dev.firebaseapp.com/api/operators/repeat))
- [x] repeatWhen ([source](https://rxjs-dev.firebaseapp.com/api/operators/repeatWhen))
- [x] retry ([source](https://rxjs-dev.firebaseapp.com/api/operators/retry))
- [x] retryWhen ([source](https://rxjs-dev.firebaseapp.com/api/operators/retryWhen))
- [x] sample ([source](https://rxjs-dev.firebaseapp.com/api/operators/sample))
- [x] sampleTime ([source](https://rxjs-dev.firebaseapp.com/api/operators/sampleTime))
- [x] scan ([source](https://rxjs-dev.firebaseapp.com/api/operators/scan))
- [x] sequenceEqual ([source](https://rxjs-dev.firebaseapp.com/api/operators/sequenceEqual))
- [ ] share => map to observable that multicasts
- [ ] shareReplay => observable that multicasts
- [x] single ([source](https://rxjs-dev.firebaseapp.com/api/operators/single))
- [x] skip ([source](https://rxjs-dev.firebaseapp.com/api/operators/skip))
- [x] skipLast ([source](https://rxjs-dev.firebaseapp.com/api/operators/skipLast))
- [x] skipUntil ([source](https://rxjs-dev.firebaseapp.com/api/operators/skipUntil))
- [x] skipWhile ([source](https://rxjs-dev.firebaseapp.com/api/operators/skipWhile))
- [x] startWith ([source](https://rxjs-dev.firebaseapp.com/api/operators/startWith))
- [ ] subscribeOn => select scheduler
- [x] switchAll ([source](https://rxjs-dev.firebaseapp.com/api/operators/switchAll))
- [x] switchMap ([source](https://rxjs-dev.firebaseapp.com/api/operators/switchMap))
- [x] switchMapTo ([source](https://rxjs-dev.firebaseapp.com/api/operators/switchMapTo))
- [x] take ([source](https://rxjs-dev.firebaseapp.com/api/operators/take))
- [x] takeLast ([source](https://rxjs-dev.firebaseapp.com/api/operators/takeLast))
- [x] takeUntil ([source](https://rxjs-dev.firebaseapp.com/api/operators/takeUntil))
- [x] takeWhile ([source](https://rxjs-dev.firebaseapp.com/api/operators/takeWhile))
- [x] tap ([source](https://rxjs-dev.firebaseapp.com/api/operators/tap))
- [x] throttle ([source](https://rxjs-dev.firebaseapp.com/api/operators/throttle))
- [x] throttleTime ([source](https://rxjs-dev.firebaseapp.com/api/operators/throttleTime))
- [x] throwIfEmpty ([source](https://rxjs-dev.firebaseapp.com/api/operators/throwIfEmpty))
- [x] timeInterval ([source](https://rxjs-dev.firebaseapp.com/api/operators/timeInterval))
- [x] timeout ([source](https://rxjs-dev.firebaseapp.com/api/operators/timeout))
- [x] timeoutWith ([source](https://rxjs-dev.firebaseapp.com/api/operators/timeoutWith))
- [x] timestamp ([source](https://rxjs-dev.firebaseapp.com/api/operators/timestamp))
- [x] toArray ([source](https://rxjs-dev.firebaseapp.com/api/operators/toArray))
- [x] window ([source](https://rxjs-dev.firebaseapp.com/api/operators/window))
- [x] windowCount ([source](https://rxjs-dev.firebaseapp.com/api/operators/windowCount))
- [x] windowTime ([source](https://rxjs-dev.firebaseapp.com/api/operators/windowTime))
- [x] windowToggle ([source](https://rxjs-dev.firebaseapp.com/api/operators/windowToggle))
- [x] windowWhen ([source](https://rxjs-dev.firebaseapp.com/api/operators/windowWhen))
- [x] withLatestFrom ([source](https://rxjs-dev.firebaseapp.com/api/operators/withLatestFrom))
- [x] zipAll ([source](https://rxjs-dev.firebaseapp.com/api/operators/zipAll))

## <sub>Roadmap</sub>

- [x] Implement operators
- [x] Checked against original implementation
- [ ] Add general introduction
- [ ] Make priority
- [ ] Tell Ben Lesh about it and get some feedback
- [ ] ~~Make playgrounds~~
- [ ] Add proper comments + playground and tweet one every day
