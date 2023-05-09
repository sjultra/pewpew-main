# Build and Push Docker Image and Helm Chart Github Action

This Github Action builds a Docker image from a Dockerfile and pushes it to Docker Hub, GitHub Container Registry, and Jfrog Container Registry, and pushes a deployable Helm Chart to Jfrog Artifactory.

## Usage

1. Create a `.github/workflows/docker.yml` file in your Github repository.
1. Copy the contents of this action into the `docker.yml` file.
1. For Jfrog Artifactory, login to your instance and
    1. Select `+ Add Repositories` from the `Repositories > Repositories` view.
    1. Create a `Local Repository` that will serve as our Artifactory.
    1. Select `Helm` as the package type.
    1. Set a value for `Repository Key` that will serve as the Artifactory's name.
    1. Select your repository from the `Artifactory > Artifacts` view.
    1. Your Jfrog fully qualified domain name (e.g; `artifactory.yourcompany.io`) will be your URL (`JFROG_URL` as we'll see in the steps below).
    1. Click `+ Generate Token` from the `User Management > Access Tokens` view.
    1. Scope permissions for the access token if desired.
    1. Click `Generate` and save the generated token. This will be your pipeline's access token (`JFROG_ACCESS_TOKEN` as we'll see in the steps below)
1. For Jfrog Container Registry, login to your instance and
    1. Select `+ Add Repositories` from the `Repositories > Repositories` view.
    1. Create a `Local Repository` that will serve as our Container Registry.
    1. Select `Docker` as the package type.
    1. Set a value for `Repository Key`. This will be your repository name (`JFROG_REPOSITORY` as we'll see in the steps below).
    1. Select your repository from the `Artifactory > Artifacts` view.
    1. Click `Set Me Up` and `Generate token and create instructions`.
    1. Save the generated token, this will be your registry password (`JFROG_TOKEN` as we'll see in the steps below).
    1. Your Jfrog email will be your username (`JFROG_USERNAME` as we'll see in the steps below).
    1. Your Jfrog fully qualified domain name (e.g; `artifactory.yourcompany.io`) will be your registry name (`JFROG_REGISTRY` as we'll see in the steps below).
1. For GitHub Container Registry, login to your GitHub account and
    1. Generate a new token from the `Settings > Developer settings > Personal access tokens` view with the following permissions: `read:packages`, `write:packages`, `delete:packages` as well as access to your repo if it is private.
    1. Save the generated token, this will be your registry password (`GH_TOKEN` as we'll see in the steps below).
1. For Docker Container Registry, login to your DockerHub account and
    1. Select `New Access Token` from the `Settings > Security` view with `read`, `write`, `delete` permissions.
    1. Save the generated token, this will be your registry password (`DOCKERHUB_TOKEN` as we'll see in the steps below).
    1. Your DockerHub username will be your username (`DOCKERHUB_USERNAME` as we'll see in the steps below).
1. Create secrets for your Docker Hub username and token, your GitHub token, and your Jfrog username, token, registry, and repository. Add these secrets to your repository's secrets.
 
```yaml
secrets:
  DOCKERHUB_USERNAME: <your_username>
  DOCKERHUB_TOKEN: <your_token>

  GH_TOKEN: <your_token>

  JFROG_REGISTRY: <your_registry>
  JFROG_USERNAME: <your_username>
  JFROG_TOKEN: <your_token>
  JFROG_REPOSITORY: <your_repository>

  JFROG_ACCESS_TOKEN: <your_access_token>
  JFROG_URL: <your_instance_url>
```

4. Modify the tags field in the Build and push step to reflect your desired Docker image name and version.
```yaml
- name: Build and push
  uses: docker/build-push-action@v4
  with:
    context: .
    file: ./docker/Dockerfile
    push: true
    tags: |
      ${{ secrets.DOCKERHUB_USERNAME }}/sammwise:latest
      ghcr.io/${{ github.repository_owner }}/sammwise:latest
      ${{ secrets.JFROG_REGISTRY }}/${{ secrets.JFROG_REPOSITORY }}/sammwise:latest
```
## Workflow
1. The workflow is triggered when code is pushed to the main branch, or when it is manually triggered from the Actions tab.
1. The build job is started on an ubuntu-latest runner.
1. The Docker image is built from the Dockerfile located in the ./docker directory.
1. The image is tagged with the specified tags.
1. The Docker image is pushed to Docker Hub and GitHub Container Registry.

## Acknowledgements
This Github Action was adapted from the [Build and Push Docker Image action by Docker](https://github.com/marketplace/actions/build-and-push-docker-images).


