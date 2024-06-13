#!/bin/bash

VERSION="${2:-v0.0.1}"
IMAGE_NAME=127.0.0.0:5000/$1:$VERSION

#Second parameter is optional and it's version, by default its v0.0.1


docker image build --tag $IMAGE_NAME -f ./Dockerfile .
docker push $IMAGE_NAME
