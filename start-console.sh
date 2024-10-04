#!/usr/bin/env bash
set -euo pipefail

# Check if 'oc' is available, otherwise exit with an error
OC=$(which oc 2>/dev/null || echo "MISSING-OC-FROM-PATH")
if [ "${OC}" = "MISSING-OC-FROM-PATH" ]; then
    echo "Missing 'oc' command. Ensure OpenShift CLI is installed and available in your PATH."
    exit 1
fi

# Ensure the user is logged into an OpenShift cluster
if ! ${OC} whoami &> /dev/null; then
    echo "You are not logged into an OpenShift cluster. Run 'oc login' before continuing."
    exit 1
fi

# Fetch OpenShift version
OPENSHIFT_VERSION=$(${OC} version | grep "Server Version: " | awk '{print $3}' | cut -d. -f-2)
CONSOLE_IMAGE=${CONSOLE_IMAGE:="quay.io/openshift/origin-console:$OPENSHIFT_VERSION"}
CONSOLE_PORT=${CONSOLE_PORT:=9000}

echo "Starting local OpenShift console..."

# Set environment variables for the OpenShift console
BRIDGE_USER_AUTH="disabled"
BRIDGE_K8S_MODE="off-cluster"
BRIDGE_K8S_AUTH="bearer-token"
BRIDGE_K8S_MODE_OFF_CLUSTER_SKIP_VERIFY_TLS=true
BRIDGE_K8S_MODE_OFF_CLUSTER_ENDPOINT=$(${OC} whoami --show-server)

# Try to get monitoring URLs, but tolerate missing config maps
set +e
BRIDGE_K8S_MODE_OFF_CLUSTER_THANOS=$(${OC} -n openshift-config-managed get configmap monitoring-shared-config -o jsonpath='{.data.thanosPublicURL}' 2>/dev/null)
BRIDGE_K8S_MODE_OFF_CLUSTER_ALERTMANAGER=$(${OC} -n openshift-config-managed get configmap monitoring-shared-config -o jsonpath='{.data.alertmanagerPublicURL}' 2>/dev/null)
set -e

BRIDGE_K8S_AUTH_BEARER_TOKEN=$(${OC} whoami --show-token 2>/dev/null)
BRIDGE_USER_SETTINGS_LOCATION="localstorage"

# Try to get GitOps route if it exists
set +e
GITOPS_HOSTNAME=$(${OC} -n openshift-gitops get route cluster -o jsonpath='{.spec.host}' 2>/dev/null)
set -e
if [ -n "$GITOPS_HOSTNAME" ]; then
    BRIDGE_K8S_MODE_OFF_CLUSTER_GITOPS="https://$GITOPS_HOSTNAME"
fi

# Output console information
echo "API Server: $BRIDGE_K8S_MODE_OFF_CLUSTER_ENDPOINT"
echo "Console Image: $CONSOLE_IMAGE"
echo "Console URL: http://localhost:${CONSOLE_PORT}"

# Prefer podman if installed, otherwise fall back to docker
if [ -x "$(command -v podman)" ]; then
    if [ "$(uname -s)" = "Linux" ]; then
        # Use host networking on Linux since host.containers.internal is unreachable in some environments.
        BRIDGE_PLUGINS="${npm_package_consolePlugin_name}=http://localhost:9001"
        podman run --pull always --rm --network=host --env-file <(set | grep BRIDGE) $CONSOLE_IMAGE
    else
        BRIDGE_PLUGINS="${npm_package_consolePlugin_name}=http://host.containers.internal:9001"
        podman run --pull always --rm -p "$CONSOLE_PORT":9000 --env-file <(set | grep BRIDGE) $CONSOLE_IMAGE
    fi
else
    BRIDGE_PLUGINS="${npm_package_consolePlugin_name}=http://host.docker.internal:9001"
    docker run --pull always --rm -p "$CONSOLE_PORT":9000 --env-file <(set | grep BRIDGE) $CONSOLE_IMAGE
fi
