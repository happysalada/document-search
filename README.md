# Template

This is a template for frontend projects with sveltekit, typescript, tailwindcss and nodejs polyfills.

To reuse this template, degit is the easiest way.
```bash
degit happysalada/sveltekit-typescrypt-tailwind-polyfills-template
```

## Developing

if you have nix and direnv installed, the dependencies required to run the project will automatically be installed for you. Otherwise, you just need `pnpm` or `npm`

```bash
pnpm run dev

# or start the server and open the app in a new browser tab
pnpm run dev -- --open
```

## Building

To create a production version of your app:

```bash
pnpm run build
```

You can preview the production build with `pnpm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.

### db setup with surreal

if you plan on using surrealdb, you'll likely need to create the following definition for user auth

setup sessions and permissions
```
DEFINE TABLE user SCHEMALESS
   PERMISSIONS 
     FOR select, update, delete WHERE id = $auth.id, 
     FOR create NONE;
DEFINE SCOPE end_user SESSION 24h
    SIGNUP ( CREATE user SET email = $email, pass = crypto::argon2::generate($pass) )
    SIGNIN ( SELECT * FROM user WHERE email = $email AND crypto::argon2::compare(pass, $pass) )
;
```

