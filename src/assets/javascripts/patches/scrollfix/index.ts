/*
 * Copyright (c) 2016-2020 Martin Donath <martin.donath@squidfunk.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

import { Observable, fromEvent, merge } from "rxjs"
import {
  map,
  mapTo,
  shareReplay,
  switchMap,
  tap
} from "rxjs/operators"

import { getElements } from "observables"

/* ----------------------------------------------------------------------------
 * Helper types
 * ------------------------------------------------------------------------- */

/**
 * Mount options
 */
interface MountOptions {
  document$: Observable<Document>      /* Document observable */
}

/* ----------------------------------------------------------------------------
 * Functions
 * ------------------------------------------------------------------------- */

/**
 * Patch all elements with `data-md-scrollfix` attributes
 *
 * This is a year-old patch which ensures that overflow scrolling works at the
 * top and bottom of containers on iOS by ensuring a `1px` scroll offset upon
 * the start of a touch event.
 *
 * @see https://bit.ly/2SCtAOO - Original source
 *
 * @param options - Options
 *
 * @return Elements observable
 */
export function patchScrollfix(
  { document$ }: MountOptions
): Observable<HTMLElement> {
  return document$
    .pipe(
      map(() => getElements("[data-md-scrollfix]")),
      switchMap(els => merge(
        ...els.map(el => fromEvent(el, "touchstart").pipe(mapTo(el))))
      ),
      tap(el => {
        const top = el.scrollTop

        /* We're at the top of the container */
        if (top === 0) {
          el.scrollTop = 1

        /* We're at the bottom of the container */
        } else if (top + el.offsetHeight === el.scrollHeight) {
          el.scrollTop = top - 1
        }
      }),
      shareReplay(1)
    )
}