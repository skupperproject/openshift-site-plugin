# OpenShift Site Plugin Guide

This plugin for Openshift installs a tab in **Projects** -> **< project name >** to create and manage a Skupper Site.

## Status

WIP

## Pre-requisites

- Openshift >= 4.15
- Skupper CRDs (from V2) installed

## Installing the Dynamic Plugin in Openshift

To install the dynamic plugin, follow these steps:

- **Authenticate with your cluster:**, then run the following command in the directory containing your `manifest.json` file.

  ```shell
  kubectl apply -f manifest.yaml
  ```

- **Enable the plugin**:

  ```shell
  kubectl patch consoles.operator.openshift.io cluster --patch '{ "spec": { "plugins": ["openshift-site-plugin"] } }' --type=merge
  ```

Alternatively you can view the list of the enabled plugins by navigating from Administration → Cluster Settings → Configuration → Console operator.openshift.io → Console plugins or on the Overview page.

## Dynamic Plugin development

### Steps to develop

- **Install the necessary modules:**

  ```shell
  yarn install
  ```

- **Start the development server:** Open a terminal and run:

  ```shell
  yarn start
  ```

- **Launch the console development environment:** Open another terminal window and execute:

  ```shell
  yarn start-console
  ```

- **Access the plugin:** Open your browser and go to localhost:9000. You will find the "Service Interconnect" tab under "Project" -> 'name of your Project'.
