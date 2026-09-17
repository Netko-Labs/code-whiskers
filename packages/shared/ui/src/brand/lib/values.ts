import type { CatExpressionName, CatExpressionSpec } from './types'

export const BRAND_NAME = 'CodeWhiskers'

export const CAT_VIEWBOX = '0 0 1024 1024'
// Same drawing with the tail cropped off the frame; pairs with overflow-visible
export const CAT_VIEWBOX_CROP = '128 214 720 620'
// Centers the drawing including the tail
export const CAT_OFFSET = 'translate(-52 14)'
// Favicon face scaled to sit inside a circle
export const CAT_ROUND_TRANSFORM = 'translate(512 512) scale(0.78) translate(-576 -508)'

export const CAT_INK = '#09090B'
export const CAT_PAPER = '#FFFFFF'

export const CAT_FILL_INK = 'var(--cw-ink)'
export const CAT_FILL_PAPER = 'var(--cw-bg)'

export const CAT_BODY_EARS =
  'M330 780 Q300 780 300 750 V340 Q300 300 320 270 L336 250 Q350 236 364 252 L424 330 H600 L660 252 Q674 236 688 250 L704 270 Q724 300 724 340 V750 Q724 780 694 780 Z'
export const CAT_BODY_FLAT =
  'M330 780 Q300 780 300 750 V340 Q300 320 310 300 L256 262 Q244 252 260 246 L424 330 H600 L764 246 Q780 252 768 262 L714 300 Q724 320 724 340 V750 Q724 780 694 780 Z'

export const CAT_NOSE = 'M512 468 L496 456 L528 456 Z'
export const CAT_MOUTH_IDLE = 'M512 468 Q500 494 478 484 M512 468 Q524 494 546 484'
export const CAT_MOUTH_SMILE = 'M470 490 Q512 522 554 490'
export const CAT_MOUTH_WORRY = 'M478 498 Q495 482 512 498 Q529 514 546 498'
export const CAT_MOUTH_FROWN = 'M478 504 Q512 478 546 504'
export const CAT_MOUTH_SMIRK = 'M512 468 Q530 492 552 482'

export const CAT_EYES_HAPPY = 'M400 432 Q430 398 460 432 M564 432 Q594 398 624 432'
export const CAT_EYES_CLOSED = 'M400 424 L460 424 M564 424 L624 424'
export const CAT_EYE_SQUINT_RIGHT = 'M566 420 L622 420'

export const CAT_TAIL_REST = 'M724 700 Q840 710 852 610 Q854 556 806 556'
export const CAT_TAIL_UP = 'M724 690 Q810 680 816 540'
export const CAT_TAIL_DOWN = 'M724 740 Q820 770 872 700'

export const CAT_ROW_MINUS = 'M350 560 L560 560'
export const CAT_ROW_CONTEXT = 'M350 624 L374 624 M400 624 L600 624'
export const CAT_ROW_PLUS_SIGN = 'M362 690 L386 690 M374 678 L374 702'
export const CAT_ROW_PLUS_TEXT = 'M410 690 L470 690 M500 690 L640 690'
export const CAT_ROW_PLUS_TEXT_SHORT = 'M410 690 L470 690'
export const CAT_ROW_CHECK = 'M478 690 L504 714 L556 668'
export const CAT_ROW_CROSS = 'M486 674 L538 706 M538 674 L486 706'
export const CAT_ROW_BANG = 'M512 676 L512 696'
export const CAT_ROW_SLEEP = 'M350 690 L520 690'

export const CAT_FAV_PLUS_SIGN = 'M370 665 L410 665 M390 645 L390 685'
export const CAT_FAV_PLUS_TEXT = 'M440 665 L640 665'

export const CAT_MARK_BANG_RIGHT = 'M880 300 L880 410'
export const CAT_MARK_BANG_LEFT = 'M200 300 L200 410'
export const CAT_MARK_BANG_FAR_RIGHT = 'M830 300 L830 410'

export const CAT_EXPRESSIONS: Record<CatExpressionName, CatExpressionSpec> = {
  idle: { eyes: 'round', mouth: 'idle', tail: 'rest', row: 'diff', body: 'ears', mark: 'none' },
  reviewing: {
    eyes: 'lidded',
    mouth: 'idle',
    tail: 'rest',
    row: 'caret',
    body: 'ears',
    mark: 'none',
  },
  thinking: {
    eyes: 'squint',
    mouth: 'smirk',
    tail: 'up',
    row: 'dots',
    body: 'ears',
    mark: 'none',
  },
  found: { eyes: 'wide', mouth: 'o', tail: 'up', row: 'bang', body: 'ears', mark: 'bang' },
  approved: {
    eyes: 'happy',
    mouth: 'smile',
    tail: 'rest',
    row: 'check',
    body: 'ears',
    mark: 'none',
  },
  blocker: { eyes: 'dot', mouth: 'worry', tail: 'down', row: 'cross', body: 'flat', mark: 'bangs' },
  sleeping: {
    eyes: 'closed',
    mouth: 'idle',
    tail: 'down',
    row: 'sleep',
    body: 'ears',
    mark: 'zz',
  },
  confused: {
    eyes: 'uneven',
    mouth: 'frown',
    tail: 'up',
    row: 'question',
    body: 'ears',
    mark: 'none',
  },
}
