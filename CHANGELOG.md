## [0.1.90](https://github.com/cloud-copilot/iam-policy/compare/v0.1.89...v0.1.90) (2026-04-26)

## [0.1.89](https://github.com/cloud-copilot/iam-policy/compare/v0.1.88...v0.1.89) (2026-04-23)


### Bug Fixes

* Allow resource policies without a Principal or NotPrincipal element ([f53fcfc](https://github.com/cloud-copilot/iam-policy/commit/f53fcfc7603269890f8c2adff7f75c7b66731bf0))

## [0.1.88](https://github.com/cloud-copilot/iam-policy/compare/v0.1.87...v0.1.88) (2026-04-22)


### Features

* ValidatedPolicy as a new type to wrap a policy that has already been validated ([1c6d62c](https://github.com/cloud-copilot/iam-policy/commit/1c6d62cc927c677a1bb24e339277288c5e425411))

## [0.1.87](https://github.com/cloud-copilot/iam-policy/compare/v0.1.86...v0.1.87) (2026-04-20)


### Bug Fixes

* Allow dashes in action strings ([3d2ca34](https://github.com/cloud-copilot/iam-policy/commit/3d2ca34baf00f2d17942130c4151ceca8f38f488))

## [0.1.86](https://github.com/cloud-copilot/iam-policy/compare/v0.1.85...v0.1.86) (2026-04-16)


### Bug Fixes

* support action strings with action after the colon or whitespace after the colon ([624bb40](https://github.com/cloud-copilot/iam-policy/commit/624bb401264ba3d4e72e78c8941f75f5e938618e))

## [0.1.85](https://github.com/cloud-copilot/iam-policy/compare/v0.1.84...v0.1.85) (2026-04-11)

## [0.1.84](https://github.com/cloud-copilot/iam-policy/compare/v0.1.83...v0.1.84) (2026-04-04)

## [0.1.83](https://github.com/cloud-copilot/iam-policy/compare/v0.1.82...v0.1.83) (2026-04-02)


### Bug Fixes

* Don't fail validation on duplicate Sids ([0737b3b](https://github.com/cloud-copilot/iam-policy/commit/0737b3b3f2e8fba7e4284e39ce8998ba5ea5ce35))

## [0.1.82](https://github.com/cloud-copilot/iam-policy/compare/v0.1.81...v0.1.82) (2026-04-02)


### Features

* Export ArnResource ([57cf972](https://github.com/cloud-copilot/iam-policy/commit/57cf972be05932ca323f1c1472841008520ca45a))

## [0.1.81](https://github.com/cloud-copilot/iam-policy/compare/v0.1.80...v0.1.81) (2026-03-28)

## [0.1.80](https://github.com/cloud-copilot/iam-policy/compare/v0.1.79...v0.1.80) (2026-03-22)

## [0.1.79](https://github.com/cloud-copilot/iam-policy/compare/v0.1.78...v0.1.79) (2026-03-09)


### Bug Fixes

* Allow any string in a resource ARN, because AWS does ([455a541](https://github.com/cloud-copilot/iam-policy/commit/455a541dc36e2d52a46d0204560cf35ca3121075))
* Allow boolean literals in condition keys ([86f7fd4](https://github.com/cloud-copilot/iam-policy/commit/86f7fd4669eaadb135826e8098a18112e54eac43))


### Features

* Treat all booleans as strings, that is what the IAM engine does, so this change simplifies things for downstream consumers ([a277234](https://github.com/cloud-copilot/iam-policy/commit/a277234e99bca3e650565242365c90ce0fef7e86))

## [0.1.78](https://github.com/cloud-copilot/iam-policy/compare/v0.1.77...v0.1.78) (2026-03-07)

## [0.1.77](https://github.com/cloud-copilot/iam-policy/compare/v0.1.76...v0.1.77) (2026-03-04)


### Bug Fixes

* Allow commas in action strings, because AWS will technically let you save that. ([7fcada3](https://github.com/cloud-copilot/iam-policy/commit/7fcada35fdd4d4facb948b9d76e12f50e2751693))

## [0.1.76](https://github.com/cloud-copilot/iam-policy/compare/v0.1.75...v0.1.76) (2026-03-02)

## [0.1.75](https://github.com/cloud-copilot/iam-policy/compare/v0.1.74...v0.1.75) (2026-02-25)

## [0.1.74](https://github.com/cloud-copilot/iam-policy/compare/v0.1.73...v0.1.74) (2026-02-25)

## [0.1.73](https://github.com/cloud-copilot/iam-policy/compare/v0.1.72...v0.1.73) (2026-02-24)

## [0.1.72](https://github.com/cloud-copilot/iam-policy/compare/v0.1.71...v0.1.72) (2026-02-23)

## [0.1.71](https://github.com/cloud-copilot/iam-policy/compare/v0.1.70...v0.1.71) (2026-02-23)

## [0.1.70](https://github.com/cloud-copilot/iam-policy/compare/v0.1.69...v0.1.70) (2026-02-22)

## [0.1.69](https://github.com/cloud-copilot/iam-policy/compare/v0.1.68...v0.1.69) (2026-02-21)

## [0.1.68](https://github.com/cloud-copilot/iam-policy/compare/v0.1.67...v0.1.68) (2026-02-14)

## [0.1.67](https://github.com/cloud-copilot/iam-policy/compare/v0.1.66...v0.1.67) (2026-01-19)

## [0.1.66](https://github.com/cloud-copilot/iam-policy/compare/v0.1.65...v0.1.66) (2026-01-11)

## [0.1.65](https://github.com/cloud-copilot/iam-policy/compare/v0.1.64...v0.1.65) (2026-01-03)

## [0.1.64](https://github.com/cloud-copilot/iam-policy/compare/v0.1.63...v0.1.64) (2025-12-27)

## [0.1.63](https://github.com/cloud-copilot/iam-policy/compare/v0.1.62...v0.1.63) (2025-12-20)

## [0.1.62](https://github.com/cloud-copilot/iam-policy/compare/v0.1.61...v0.1.62) (2025-12-13)

## [0.1.61](https://github.com/cloud-copilot/iam-policy/compare/v0.1.60...v0.1.61) (2025-12-06)

## [0.1.60](https://github.com/cloud-copilot/iam-policy/compare/v0.1.59...v0.1.60) (2025-11-30)

## [0.1.59](https://github.com/cloud-copilot/iam-policy/compare/v0.1.58...v0.1.59) (2025-11-22)

## [0.1.58](https://github.com/cloud-copilot/iam-policy/compare/v0.1.57...v0.1.58) (2025-11-15)

## [0.1.57](https://github.com/cloud-copilot/iam-policy/compare/v0.1.56...v0.1.57) (2025-11-09)


### Bug Fixes

* Remove GuardDog package scan ([46b20a4](https://github.com/cloud-copilot/iam-policy/commit/46b20a416076c7814669316b2fd007e5c6c9fe3a))

## [0.1.56](https://github.com/cloud-copilot/iam-policy/compare/v0.1.55...v0.1.56) (2025-11-08)

## [0.1.55](https://github.com/cloud-copilot/iam-policy/compare/v0.1.54...v0.1.55) (2025-11-01)

## [0.1.54](https://github.com/cloud-copilot/iam-policy/compare/v0.1.53...v0.1.54) (2025-10-25)

## [0.1.53](https://github.com/cloud-copilot/iam-policy/compare/v0.1.52...v0.1.53) (2025-10-18)

## [0.1.52](https://github.com/cloud-copilot/iam-policy/compare/v0.1.51...v0.1.52) (2025-10-11)

## [0.1.51](https://github.com/cloud-copilot/iam-policy/compare/v0.1.50...v0.1.51) (2025-10-11)

## [0.1.50](https://github.com/cloud-copilot/iam-policy/compare/v0.1.49...v0.1.50) (2025-10-04)


### Features

* Add toJSON to Statement ([9ab9d12](https://github.com/cloud-copilot/iam-policy/commit/9ab9d129f784fb9d8f635c71e360fff5e3838a02))

## [0.1.49](https://github.com/cloud-copilot/iam-policy/compare/v0.1.48...v0.1.49) (2025-10-04)

## [0.1.48](https://github.com/cloud-copilot/iam-policy/compare/v0.1.47...v0.1.48) (2025-09-28)

## [0.1.47](https://github.com/cloud-copilot/iam-policy/compare/v0.1.46...v0.1.47) (2025-09-19)


### Features

* Update SCP validation for new IAM Features ([555fbc5](https://github.com/cloud-copilot/iam-policy/commit/555fbc5b9684d5288542279b4695ecb7cba05096))

## [0.1.46](https://github.com/cloud-copilot/iam-policy/compare/v0.1.45...v0.1.46) (2025-09-15)

## [0.1.45](https://github.com/cloud-copilot/iam-policy/compare/v0.1.44...v0.1.45) (2025-09-07)

## [0.1.44](https://github.com/cloud-copilot/iam-policy/compare/v0.1.43...v0.1.44) (2025-08-30)

## [0.1.43](https://github.com/cloud-copilot/iam-policy/compare/v0.1.42...v0.1.43) (2025-08-23)

## [0.1.42](https://github.com/cloud-copilot/iam-policy/compare/v0.1.41...v0.1.42) (2025-08-16)

## [0.1.41](https://github.com/cloud-copilot/iam-policy/compare/v0.1.40...v0.1.41) (2025-08-09)

## [0.1.40](https://github.com/cloud-copilot/iam-policy/compare/v0.1.39...v0.1.40) (2025-08-03)

## [0.1.39](https://github.com/cloud-copilot/iam-policy/compare/v0.1.38...v0.1.39) (2025-07-26)

## [0.1.38](https://github.com/cloud-copilot/iam-policy/compare/v0.1.37...v0.1.38) (2025-07-19)

## [0.1.37](https://github.com/cloud-copilot/iam-policy/compare/v0.1.36...v0.1.37) (2025-07-12)

## [0.1.36](https://github.com/cloud-copilot/iam-policy/compare/v0.1.35...v0.1.36) (2025-07-08)

## [0.1.35](https://github.com/cloud-copilot/iam-policy/compare/v0.1.34...v0.1.35) (2025-06-30)


### Features

* Improved VPC Endpoint validation ([5af57cb](https://github.com/cloud-copilot/iam-policy/commit/5af57cbed43dfc921b419a8f83d68183a35d6142))

## [0.1.34](https://github.com/cloud-copilot/iam-policy/compare/v0.1.33...v0.1.34) (2025-06-29)

## [0.1.33](https://github.com/cloud-copilot/iam-policy/compare/v0.1.32...v0.1.33) (2025-06-29)


### Bug Fixes

* Correct return types of metadata policies ([1c66199](https://github.com/cloud-copilot/iam-policy/commit/1c66199a7b9975eabb9ea611f41db4a490c187dc))

## [0.1.32](https://github.com/cloud-copilot/iam-policy/compare/v0.1.31...v0.1.32) (2025-06-21)

## [0.1.31](https://github.com/cloud-copilot/iam-policy/compare/v0.1.30...v0.1.31) (2025-06-17)

## [0.1.30](https://github.com/cloud-copilot/iam-policy/compare/v0.1.29...v0.1.30) (2025-06-08)

## [0.1.29](https://github.com/cloud-copilot/iam-policy/compare/v0.1.28...v0.1.29) (2025-06-03)


### Features

* adding the ability to get back the conditions from a statement as a map ([c95acc5](https://github.com/cloud-copilot/iam-policy/commit/c95acc5ec7e9952992b4d322a288b4dca4b11a3c))

## [0.1.28](https://github.com/cloud-copilot/iam-policy/compare/v0.1.27...v0.1.28) (2025-06-03)


### Features

* Improving detection of wildcard principals ([a1edf2d](https://github.com/cloud-copilot/iam-policy/commit/a1edf2d591c7b62d8d624e9cc1884b2f42090c72))

## [0.1.27](https://github.com/cloud-copilot/iam-policy/compare/v0.1.26...v0.1.27) (2025-05-26)


### Bug Fixes

* Fix generic resource policy validation. Should not expect Resource or NotResource. ([9d2ee8a](https://github.com/cloud-copilot/iam-policy/commit/9d2ee8a1772c93cec28af2647c7421cbbc0eec29))

## [0.1.26](https://github.com/cloud-copilot/iam-policy/compare/v0.1.25...v0.1.26) (2025-05-26)

## [0.1.25](https://github.com/cloud-copilot/iam-policy/compare/v0.1.24...v0.1.25) (2025-05-24)

## [0.1.24](https://github.com/cloud-copilot/iam-policy/compare/v0.1.23...v0.1.24) (2025-05-17)


### Features

* Allow storing metadata with a policy ([298c905](https://github.com/cloud-copilot/iam-policy/commit/298c905cdfc1d174dfb513f17d0d1aa6932904bb))

## [0.1.23](https://github.com/cloud-copilot/iam-policy/compare/v0.1.22...v0.1.23) (2025-05-17)

## [0.1.22](https://github.com/cloud-copilot/iam-policy/compare/v0.1.21...v0.1.22) (2025-05-10)

## [0.1.21](https://github.com/cloud-copilot/iam-policy/compare/v0.1.20...v0.1.21) (2025-05-04)

## [0.1.20](https://github.com/cloud-copilot/iam-policy/compare/v0.1.19...v0.1.20) (2025-04-26)

## [0.1.19](https://github.com/cloud-copilot/iam-policy/compare/v0.1.18...v0.1.19) (2025-04-19)

## [0.1.18](https://github.com/cloud-copilot/iam-policy/compare/v0.1.17...v0.1.18) (2025-04-12)

## [0.1.17](https://github.com/cloud-copilot/iam-policy/compare/v0.1.16...v0.1.17) (2025-04-05)

## [0.1.16](https://github.com/cloud-copilot/iam-policy/compare/v0.1.15...v0.1.16) (2025-03-01)

## [0.1.15](https://github.com/cloud-copilot/iam-policy/compare/v0.1.14...v0.1.15) (2025-02-14)

## [0.1.14](https://github.com/cloud-copilot/iam-policy/compare/v0.1.13...v0.1.14) (2025-01-26)


### Features

* Adding a new policy function for getting the raw policy object. ([#4](https://github.com/cloud-copilot/iam-policy/issues/4)) ([c4ab31b](https://github.com/cloud-copilot/iam-policy/commit/c4ab31b6ed4208d82186413dcdfb55b76d37c560))

## [0.1.13](https://github.com/cloud-copilot/iam-policy/compare/v0.1.12...v0.1.13) (2025-01-25)
