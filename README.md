# Recommended VSCode Extensions
* [CSS Modules](https://marketplace.visualstudio.com/items?itemName=clinyong.vscode-css-modules)
* [Path Intellisense](https://marketplace.visualstudio.com/items?itemName=christian-kohler.path-intellisense)
* [Project Snippets](https://marketplace.visualstudio.com/items?itemName=rebornix.project-snippets)
* [Blueprint](https://marketplace.visualstudio.com/items?itemName=teamchilla.blueprint)
    * set `blueprint.templatesPath` to `.vscode/bp`.

# Requirements

### BASIC
1. node - 8.17.0
2. python - 2.7
3. Install node-gyp v3.6.2 globally
4. Run `which node-gyp` copy the path
5. Run `npm config set node_gyp <node-gyp-path>` - set node-gyp path
6. Install electron v6.1.12 globally 
7. Run `which electron` copy the path
8. Set electron global path into `run-application.js` - `electronPath` constant

### Windows
1. Install Python 2.7.x
2. Install Visual Studio
3. Configure GYP (through NPM) to use the correct Visual Studio version with: `npm config set msvs_version 2017 --global`

# To Develop
1. Clone the repo
2. Run `npm run bootstrap`
3. Run `npm run watch:browser` and `npm run serve`
4. Run `npm run start:with-dev-server` to start the app.  In order to see any browser changes, you will need to restart the app.

# To Release
### Windows
1. Set the environment variables `RYVER_CODESIGN_PATH` and `RYVER_CODESIGN_PASS`.
2. Run `npm run build:win`

### Linux
1. 
    a. Run `npm run build:deb`
    b. Run `npm run build:rpm`

### OSX
1. Run `npm run build:osx` 

# To Deploy For Auto Update
1. Create a new __DRAFT__ release on GitHub.
2a. For Windows:
    * Make a `RELEASES` file that contains both `.nupkg` entires with the appropriate names (they will need to be changed).
    * Upload the `RELEASES` file and both `.nupkg` files to the release.
2b. For OSX:
    * Upload the `.zip` file.

# Version Names
The format is ADJ + NOUN, with alliteration if possible, and it must be fun.  Use https://www.michaelfogleman.com/phrases/ for options.

# Versions
| Name | App | Electron |
| --- | --- | --- |
| Complete Cats | 1.1.6 | 0.35.5 |
| Wild Wren | 1.1.7 | 1.3.4 |
| Tested Turn | 1.1.8 | 1.4.0 |
| Outgoing Owl | 1.2.0 | 1.4.0 |
| Courageous Cabbage | 1.2.1 | 1.6.0 |
| Puzzling Pies | 1.3.0 | 2.0.0 |
| Crazy Clouds | 1.3.2 | 2.0.2 |
