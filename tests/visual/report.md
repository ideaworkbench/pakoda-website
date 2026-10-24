# Visual comparison with Figma

pixelmatch, threshold 0.1. Raw counts anti-aliased pixels; filtered ignores them (`includeAA: false`). Over 0.5% filtered is a defect.
Pixels that are transparent in the Figma export are not compared.

| Screen | Figma node | Raw mismatch | Filtered mismatch | Masks | Result |
| --- | --- | --- | --- | --- | --- |
| landing-1470 | 1-96 | 0.818% | 0.228% | none | pass |
| landing-1728 | 1-119 | 0.560% | 0.156% | none | pass |
| landing-overlay-form | 30-25159 | 0.911% | 0.299% | none | pass |
| form-default | 7-196 | 1.940% | 0.873% | 16×16 at (32, 392), 336×36 at (32, 450) | **defect** |
| form-mobile-number | 27-24951 | 2.867% | 1.709% | 16×16 at (32, 392), 336×36 at (32, 450) | **defect** |
| form-business-type-open | 7-4525 | 1.451% | 0.715% | none | **defect** |
| form-order-channels-open | 11-9170 | 7.460% | 6.064% | none | **defect** |
| form-field-error | 7-6775 | 2.640% | 1.526% | none | **defect** |
| form-loading | 11-9300 | 2.496% | 1.255% | 16×16 at (32, 392) | **defect** |
| result-on-the-list | 7-6308 | missing | missing | — | not captured |
| result-already-on-the-list | 7-6743 | missing | missing | — | not captured |
