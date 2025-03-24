#!/usr/bin/env bash

set -euo pipefail

PREFER_PODMAN="${PREFER_PODMAN:-0}"
PUSH="${PUSH:-0}"
TAG="${TAG:-latest}"
REGISTRY_ORG="${REGISTRY_ORG:-vbartoli}"
SKUPPER_NAME="${SKUPPER_NAME:-skupper}"

if [[ -x "$(command -v podman)" && $PREFER_PODMAN == 1 ]]; then
    OCI_BIN="podman"
else
    OCI_BIN="docker"
fi

BASE_IMAGE="quay.io/${REGISTRY_ORG}/rhsi-plugin"
IMAGE=${BASE_IMAGE}:${TAG}

echo "Building image '${IMAGE}' with ${OCI_BIN}"
$OCI_BIN build --build-arg SKUPPER_NAME="${SKUPPER_NAME}" -t $IMAGE .

if [[ $PUSH == 1 ]]; then
    $OCI_BIN push $IMAGE
fi
