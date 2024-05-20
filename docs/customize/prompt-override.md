---
layout: default
title: Prompt Override
parent: Customize Features
nav_order: 2
---

Prompt Override ([#54](https://github.com/unit-mesh/auto-dev/issues/54)) will override the AutoDev prompt with your own
prompt.

## How to use

create a folder named `prompt/genius` in your project root directory, then create the prompt file which defined in
Supported Action.

For example, create a file named `prompts/genius/sql/sql-gen-clarify.vm`, will override the clarify prompt of AutoSQL/GenSQL

## Supported Action
