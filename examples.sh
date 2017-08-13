#!/bin/sh

for f in `ls examples`
do
  bin/index.js examples/$f | `npm bin`/tap-spec
done
