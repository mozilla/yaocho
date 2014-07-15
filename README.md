# Yaocho — offline support for Mozilla products.

Yaocho is an offline enabled open webapp to view knowledge base articles from
Mozilla Support.

## TL;DR

```
git clone https://github.com/mozilla/yaocho.git
cd yaocho
npm install
gulp dev
```

## Getting Started

To get you started you can simply clone the yaocho repository and install the dependencies:

### Prerequisites

You need git to clone the yaocho repository. You can get it from
[http://git-scm.com/](http://git-scm.com/).

We also use a number of node.js tools to initialize and test yaocho. You must have node.js and
its package manager (npm) installed.  You can get them from [http://nodejs.org/](http://nodejs.org/).

### Clone yaocho

Clone the yaocho repository using [git][git]:

```
git clone https://github.com/mozilla/yaocho.git
cd yaocho
```

### Install Dependencies

We have two kinds of dependencies in this project: tools and angular framework code.  The tools help
us manage and test the application.

* We get the tools we depend upon via `npm`, the [node package manager][npm].
* We get the angular code via `bower`, a [client-side code package manager][bower].

We have preconfigured `npm` to automatically run `bower` so we can simply do:

```
npm install
```

Behind the scenes this will also call `bower install`.  You should find that you have two new
folders in your project.

* `node_modules` - contains the npm packages for the tools we need
* `app/bower_components` - contains the angular framework files

*Note that the `bower_components` folder would normally be installed in the root folder but
yaocho changes this location through the `.bowerrc` file.  Putting it in the app folder makes
it easier to serve the files by a webserver.*

### Run the Application

Yaocho uses [Gulp.js](http://gulpjs.com) as a task runner. This should have been installed with the dependencies. Gulp has tasks to build various parts of the site, and tasks useful for deployment. The most important command for now is

```
gulp dev
```

> You may have to run that as `node_modules/.bin/gulp dev`, if your path is not set up for node modules.

Now browse to the app at `http://localhost:8000/`.

## Updating Angular

You can update the tool dependencies by running:

```
npm update
```

This will find the latest versions that match the version ranges specified in the `package.json` file.

You can update the Angular dependencies by running:

```
bower update
```

This will find the latest versions that match the version ranges specified in the `bower.json` file.
