# PRD — LLM Power Rankings

## Product

A research interface for comparing text-generation models actually routable through Venice and Morpheus, with independent benchmark context and provenance-bearing technical metadata.

## Core contract

`provider catalogs + model research + benchmark evidence -> canonical model records -> filters / tiers / compare`

## Principles

1. Provider availability and intelligence are separate facts.
2. Unknown values stay unknown.
3. Serving quantization is not conflated with downloadable checkpoint precision.
4. One scalar rank is useful navigation, never the only view.
5. Every curated field should be replaceable by a stronger primary source.
