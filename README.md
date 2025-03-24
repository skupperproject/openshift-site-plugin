# OpenShift Site Plugin Guide

This plugin for Openshift installs a tab in **Projects** -> **< project name >** to create and manage a Skupper Site.

![alt text](https://github.com/user-attachments/assets/116af7b5-4019-401e-bb61-1fbc68b6c6d1)

![alt text](https://github.com/user-attachments/assets/e5f2dd6a-23ae-4926-bef6-5d55a7abb6b6)

![alt text](https://github.com/user-attachments/assets/3af884af-7953-465d-ae17-7eff74cbe655)

![alt text](https://github.com/user-attachments/assets/7a3b589f-6915-4d6c-bd58-623187efc465)

## Pre-requisites

- Openshift >= 4.15
- Skupper CRDs (from V2) installed

## Installing the Dynamic Plugin in Openshift

To install the dynamic plugin, follow these steps:

- **Authenticate with your cluster:**, then run the following command in the directory containing your `manifest.yaml` file.

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

- **Access the plugin:** Open your browser and go to localhost:9000. You will find the plugin tab under "Project" -> 'name of your Project'.

## Customizing the Tab Name and Skupper References

This plugin allows you to customize the tab name and all references to "Skupper" within the plugin. This is achieved using the `SKUPPER_NAME` environment variable.

**How to Customize:**

1. **Set the `SKUPPER_NAME` environment variable:**

   To modify the name, prefix your `yarn start` or image build command with `SKUPPER_NAME=<desired name>`

## Building a Docker Image

The `manifest.yaml` file references a Docker image that contains the plugin. To build and push your own customized Docker image, use the following command:

```bash
SKUPPER_NAME=<desired tab name> ./build-image.sh
```

**Environment Variables Used by `build-image.sh`:**

The `build-image.sh` script leverages several environment variables to configure the image build. Here's a breakdown of each variable:

- **`PREFER_PODMAN`**: Specifies whether to prefer `podman` over `docker` for building the image.

  - **Default:** `0` (uses `docker` if available). Set to `1` to force the script to use `podman` if it's installed.

- **`PUSH`**: Determines whether to automatically push the built image to the container registry.

  - **Default:** `0` (does not push the image). Set to `1` to push the image after building.

- **`TAG`**: Defines the tag to apply to the Docker image.

  - **Default:** `latest`. You can use this to specify a version number (e.g., `1.0.0`).

- **`REGISTRY_ORG`**: Specifies the organization or username in the container registry where the image will be pushed (if `PUSH` is set to `1`).

  - **Default:** `skupper`. Change this to your own registry organization.

- **`SKUPPER_NAME`**: Sets the name of the tab within the plugin and updates all references to "Skupper" in the code. See the "Customizing the Tab Name and Skupper References" section for more details.

  - **Default:** `""` (Empty String). If not provided, "Skupper" will be used as the default.
