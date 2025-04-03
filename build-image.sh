#!/usr/bin/env bash

set -euo pipefail

PREFER_PODMAN="${PREFER_PODMAN:-0}"
PUSH="${PUSH:-0}"
TAG="${TAG:-latest}"
SKUPPER_NAME="${SKUPPER_NAME:-skupper}"
REGISTRY_ORG="quay.io/${REGISTRY_ORG:-skupper}/rhsi-plugin"
IMAGE=${REGISTRY_ORG}:${TAG}

if [[ -x "$(command -v podman)" && $PREFER_PODMAN == 1 ]]; then
    OCI_BIN="podman"
else
    OCI_BIN="docker"
fi


echo "Building image '${IMAGE}' with ${OCI_BIN}"
$OCI_BIN build --build-arg SKUPPER_NAME="${SKUPPER_NAME}" -t $IMAGE .

if [[ $PUSH == 1 ]]; then
    $OCI_BIN push $IMAGE
fi
