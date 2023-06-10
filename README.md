# `orbit-utils`

A collection of utility packages for [Orbit.js](https://orbitjs.com/).

See a utility package's `README.md` for more information about that particular utility package.

-   [`@orbit-utils/zod-to-model-definition`](packages/zod-to-model-definition#readme)
-   [`@orbit-utils/any-api-source`](packages/any-api-source#readme)

## Development environment

You need to set up a development environment in order to:

-   Develop / contribute to the library

### Configuring the development environment the recommended way

The recommended way to set up the development environment is to use [VSCode](https://code.visualstudio.com/) and the [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension and [clone the repository in a container volume](https://code.visualstudio.com/docs/devcontainers/containers#_quick-start-open-a-git-repository-or-github-pr-in-an-isolated-container-volume). This way everything is set up for you automatically.

If you don't want to use VSCode and the Dev Containers extension, read on about configuring the development environment.

### Configuring the development environment manually

1. Install [Node.js](https://nodejs.org/en) v16.13 or newer (the newer, the better).

2. Enable [Corepack](https://nodejs.org/api/corepack.html) so that the correct package manager is used.
   If you installed Node.js using Homebrew, you'll need to install Corepack separately:

    ```sh
    brew install corepack
    ```

    Else, Corepack is bundled with Node.js, and to enable it, all you need to do is run the command:

    ```sh
    corepack enable
    ```

3. Install project dependencies by running the following command in the root of your repo.
    ```sh
    pnpm install
    ```
