# Visual comparison with Figma

pixelmatch, threshold 0.1. Raw counts anti-aliased pixels; filtered ignores them (`includeAA: false`). Over 0.5% filtered is a defect.
Pixels that are transparent in the Figma export are not compared.

| Screen | Figma node | Raw mismatch | Filtered mismatch | Masks | Result |
| --- | --- | --- | --- | --- | --- |
| landing-1470 | 1-96 | 0.818% | 0.228% | none | pass |
| landing-1728 | 1-119 | 0.560% | 0.156% | none | pass |
| landing-overlay-form | 30-25159 | missing | missing | — | not captured |
| form-default | 7-196 | missing | missing | — | not captured |
| form-mobile-number | 27-24951 | missing | missing | — | not captured |
| form-business-type-open | 7-4525 | missing | missing | — | not captured |
| form-order-channels-open | 11-9170 | missing | missing | — | not captured |
| form-field-error | 7-6775 | missing | missing | — | not captured |
| form-loading | 11-9300 | missing | missing | — | not captured |
| result-on-the-list | 7-6308 | missing | missing | — | not captured |
| result-already-on-the-list | 7-6743 | missing | missing | — | not captured |
