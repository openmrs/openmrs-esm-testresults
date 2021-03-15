# OpenMRS SPA Extension Workshop

## Tasks

1. Add a new page leading to `.../playground` (e.g., http://localhost:8080/openmrs/spa/playground)
2. Show the `location-picker` extension (actually coming from `@openmrs/esm-login-app`) on this page (**hint**: the slot has the same name)
3. Register an extension component wired up to the `nav-menu` slot - it should be a link to the `/playground` page
4. Show the `location-picker` on the homescreen (`/home`) registered by `@openmrs/esm-home-app` (**question**: how to find out how the extension slot is called there?)
5. Add a "dynamic" extension slot on the `/playground` page showing any slot defined from the value of textbox on the page

## Developing

Start the development process with

```sh
npm start
```

If you run into problems make sure you installed the dependencies first using:

```sh
npm i
```

Also if the available memory is not sufficient you can use

```sh
npm run start:large
```

instead.

The main file to take care off is the `index.ts` located in the `src` folder.
