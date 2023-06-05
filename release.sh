#!/bin/bash

VERSION=v2.1.0
sed "s/branch-comparer:v[0-9]\.[0-9]\.[0-9]/branch-comparer:$VERSION/g" README.md > _README.md && mv _README.md README.md && \
docker build . -t  windranger/branch-comparer:$VERSION && \
docker push windranger/branch-comparer:$VERSION


