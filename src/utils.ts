/**
 * utils
 *
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

import { timer, from } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';

export function ofTimer(...args: number[]) {
	return from(args).pipe(mergeMap(v => timer(v).pipe(map(__ => v)), 1));
}

export function ofTimerAbsolute(...args: number[]) {
	let delta = 0;
	return from(args).pipe(
		mergeMap(v => {
			let diff = v - delta;
			delta += diff;
			return timer(diff).pipe(map(x => v));
		}, 1)
	);
}
