# Visual comparison with Figma

pixelmatch, threshold 0.1. Raw counts anti-aliased pixels; filtered ignores them (`includeAA: false`).
A filtered mismatch over the limit is a defect: 0.5% for full frames, 1% for card-only captures.
On card frames, pixels in Figma's canvas colour (#1E1E1E within ±3 per channel, outside the card) are not compared.
Figma | build | diff images for card screens are in tests/visual/side-by-side/.

| Screen | Figma node | Raw mismatch | Filtered mismatch | Limit | Masks | Result |
| --- | --- | --- | --- | --- | --- | --- |
| landing-1470 | 1-96 | 0.818% | 0.228% | 0.500% | none | pass |
| landing-1728 | 1-119 | 0.560% | 0.156% | 0.500% | none | pass |
| landing-overlay-form | 30-25159 | 0.911% | 0.299% | 0.500% | none | pass |
| form-default | 7-196 | 1.877% | 0.807% | 1.000% | 2: checkbox state impossible with these field values; button state impossible with these field values | pass |
| form-mobile-number | 27-24951 | 2.044% | 0.915% | 1.000% | 2: checkbox state impossible with these field values; button state impossible with these field values | pass |
| form-business-type-open | 7-4525 | 1.391% | 0.653% | 1.000% | none | pass |
| form-order-channels-open | 11-9170 | 1.381% | 0.607% | 1.000% | 1: labels shown while open (approved deviation) | pass |
| form-field-error | 7-6775 | 1.893% | 0.805% | 1.000% | none | pass |
| form-loading | 11-9300 | 1.402% | 0.605% | 1.000% | 7: checkbox state impossible with these field values; Figma shows empty fields while sending | pass |
| result-on-the-list | 7-6308 | — | — | — | — | not captured |
| result-already-on-the-list | 7-6743 | — | — | — | — | not captured |
