[How can I use files in Vercel Functions?](https://vercel.com/guides/how-can-i-use-files-in-serverless-functions#how-can-i-use-files-in-vercel-functions)
=========================================================================================================================================================

Learn how to import files inside Serverless Functions on Vercel.

Last updated on September 5, 2024

Functions

* * * * *

This guide will explain how to read files from Vercel Functions, both when used with frameworks like Next.js or standalone on Vercel. We'll explain how bundling works, how you can tell Vercel to include additional files for use at runtime in your functions, and more.

[How bundling application code works](https://vercel.com/guides/how-can-i-use-files-in-serverless-functions#how-bundling-application-code-works)
------------------------------------------------------------------------------------------------------------------------------------------------

Your application gets bundled during a build to include all necessary user code and dependencies needed for runtime.

Both Next.js and general Vercel Functions use Vercel's [Node File Trace](https://github.com/vercel/nft) to determine which files (including those in `node_modules`) are necessary to be included. This uses static analysis to inspect any `import`, `require`, and `fs` usage and determine all files that a page might load.

[Examples of reading files](https://vercel.com/guides/how-can-i-use-files-in-serverless-functions#examples-of-reading-files)
----------------------------------------------------------------------------------------------------------------------------

### [Using `process.cwd()`](https://vercel.com/guides/how-can-i-use-files-in-serverless-functions#using-process.cwd)

We recommend using `process.cwd()` to determine the current directory of the Vercel Function instead of using `__dirname`. For example, this function reads the file `users.json` from the root of the repository.

api/file.js

```
import fs from 'fs';import path from 'path';
export function GET(request) {  let usersPath = path.join(process.cwd(), 'users.json');  let file = fs.readFileSync(usersPath);  return new Response(file);}
```

### [Using dynamic `require`](https://vercel.com/guides/how-can-i-use-files-in-serverless-functions#using-dynamic-require)

If you are trying to write your code using ES Modules, sometimes you might rely on CommonJS code. To dynamically require and include a function using CJS, you can write a function as follows:

api/file.js

```
import { createRequire } from 'node:module';
let sayHello = createRequire(import.meta.url)('../greet.cjs');
export function GET(request) {  return new Response(sayHello());}
```

This function `api/file.js` is requiring `greet.cjs`, which is in the root of the repository.

greet.js

```
function sayHello() {  return 'Hello, World!';}
module.exports = sayHello;
```

To test this locally, ensure your `package.json` is configured for ES Modules:

package.json

```
{  "type": "module"}
```

Finally, to tell Vercel to include the `greet.cjs` file while bundling, modify `vercel.json`:

vercel.json

```
{  "functions": {    "api/file.js": {      "includeFiles": "greet.cjs"    }  }}
```

### [Using Next.js](https://vercel.com/guides/how-can-i-use-files-in-serverless-functions#using-next.js)

Since Next.js has its own build process which uses Node File Trace, you would use the [built-in functionality](https://nextjs.org/docs/pages/api-reference/next-config-js/output#caveats) of the framework to include additional files rather than `vercel.json`. The file path can be a [glob](https://www.npmjs.com/package/minimatch) to select multiple files.

Notably, if you are trying to read files from `node_modules`, you will need to add this to `outputFileTracingIncludes`.

next.config.js

```
module.exports = {  experimental: {    outputFileTracingIncludes: {      '/api/another': ['./necessary-folder/**/*'],    },  },}
```

Further, sometimes if you are using a [monorepo](https://vercel.com/docs/monorepos), you'll have a different root directory for your application. To include files outside of that folder with Next.js, you can use:

next.config.js

```
module.exports = {  experimental: {    // includes files from the monorepo base two directories up    outputFileTracingRoot: path.join(__dirname, '../../'),  },}
```

### [Using SvelteKit](https://vercel.com/guides/how-can-i-use-files-in-serverless-functions#using-sveltekit)

SvelteKit uses Node File Trace and also supports the ability to read files. You do not need to modify `vercel.json` with this approach.

src/routes/read-file/+page.server.js

```
import { read } from '$app/server';import users from './users.json';
export async function load() {  return {    users: await read(users).text()  };}
```

### [Using Astro](https://vercel.com/guides/how-can-i-use-files-in-serverless-functions#using-astro)

Astro uses Node File Trace and also supports the ability to [include](https://docs.astro.build/en/guides/integrations-guide/vercel/#includefiles) or [exclude](https://docs.astro.build/en/guides/integrations-guide/vercel/#excludefiles) files. You do not need to modify `vercel.json` with this approach.

astro.config.mjs

```
import { defineConfig } from 'astro/config';import vercel from '@astrojs/vercel/serverless';
export default defineConfig({  output: 'server',  adapter: vercel({    includeFiles: ['./users.json'],  }),});
```

### [Using Nuxt](https://vercel.com/guides/how-can-i-use-files-in-serverless-functions#using-nuxt)

Nuxt can use [server assets](https://github.com/pi0/nuxt-server-assets) to include files into your Vercel Function. Any file inside `server/assets/` is by default included. You can access server assets using [storage](https://nitro.unjs.io/guide/storage) API.

```
export default defineEventHandler(async () => {  // https://nitro.unjs.io/guide/assets#server-assets  const assets = useStorage('assets:server')  const users = await assets.getItem('users.json')  return {    users  }})
```

This also integrates with Vercel KV. [Learn more](https://github.com/pi0/nuxt-server-assets).

[Examples of writing files](https://vercel.com/guides/how-can-i-use-files-in-serverless-functions#examples-of-writing-files)
----------------------------------------------------------------------------------------------------------------------------

If you are looking for a way to write files, we recommend persisting to object storage like [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) or similar solutions.

------

[functions](https://vercel.com/docs/projects/project-configuration#functions)
-----------------------------------------------------------------------------

Type: `Object` of key `String` and value `Object`.

### [Key definition](https://vercel.com/docs/projects/project-configuration#key-definition)

A [glob](https://github.com/isaacs/node-glob#glob-primer) pattern that matches the paths of the Serverless Functions you would like to customize:

-   `api/*.js` (matches one level e.g. `api/hello.js` but not `api/hello/world.js`)
-   `api/**/*.ts` (matches all levels `api/hello.ts` and `api/hello/world.ts`)
-   `src/pages/**/*` (matches all functions from `src/pages`)
-   `api/test.js`

### [Value definition](https://vercel.com/docs/projects/project-configuration#value-definition)

-   `runtime` (optional): The npm package name of a [Runtime](https://vercel.com/docs/functions/serverless-functions/runtimes), including its version.
-   `memory` (optional): An integer defining the memory in MB for your Serverless Function (between `128` and `3009`).
-   `maxDuration` (optional): An integer defining how long your Serverless Function should be allowed to run on every request in seconds (between `1` and the maximum limit of your plan, as mentioned below).
-   `includeFiles` (optional): A [glob](https://github.com/isaacs/node-glob#glob-primer) pattern to match files that should be included in your Serverless Function. If you're using a Community Runtime, the behavior might vary. Please consult its documentation for more details. (Not supported in Next.js, instead use [`outputFileTracingIncludes`](https://nextjs.org/docs/app/api-reference/next-config-js/output) in `next.config.js` )
-   `excludeFiles` (optional): A [glob](https://github.com/isaacs/node-glob#glob-primer) pattern to match files that should be excluded from your Serverless Function. If you're using a Community Runtime, the behavior might vary. Please consult its documentation for more details. (Not supported in Next.js, instead use [`outputFileTracingIncludes`](https://nextjs.org/docs/app/api-reference/next-config-js/output) in `next.config.js` )

### [Description](https://vercel.com/docs/projects/project-configuration#description)

By default, no configuration is needed to deploy Serverless Functions to Vercel.

For all [officially supported runtimes](https://vercel.com/docs/functions/serverless-functions/runtimes), the only requirement is to create an `api` directory at the root of your project directory, placing your Serverless Functions inside.

The `functions` property cannot be used in combination with `builds`. Since the latter is a legacy configuration property, we recommend dropping it in favor of the new one.

Because [Incremental Static Regeneration (ISR)](https://vercel.com/docs/incremental-static-regeneration) uses Serverless Functions, the same configurations apply. The ISR route can be defined using a glob pattern, and accepts the same properties as when using Serverless Functions.

When deployed, each Serverless Function receives the following properties:

-   Memory: 1024 MB (1 GB) - (Optional)
-   Maximum Duration: 10s default - 60s (Hobby), 15s default - 300s (Pro), or 15s default - 900s (Enterprise). This [can be configured](https://vercel.com/docs/functions/serverless-functions/runtimes#maxduration) up to the respective plan limit) - (Optional)

To configure them, you can add the `functions` property.

#### [`functions` property with Serverless Functions](https://vercel.com/docs/projects/project-configuration#functions-property-with-serverless-functions)

vercel.json

```
{  "functions": {    "api/test.js": {      "memory": 3009,      "maxDuration": 30    },    "api/*.js": {      "memory": 3009,      "maxDuration": 30    }  }}
```

#### [`functions` property with ISR](https://vercel.com/docs/projects/project-configuration#functions-property-with-isr)

vercel.json

```
{  "functions": {    "pages/blog/[hello].tsx": {      "memory": 1024    },    "src/pages/isr/**/*": {      "maxDuration": 10    }  }}
```

### [Using unsupported runtimes](https://vercel.com/docs/projects/project-configuration#using-unsupported-runtimes)

In order to use a runtime that is not [officially supported](https://vercel.com/docs/functions/serverless-functions/runtimes), you can add a `runtime` property to the definition:

vercel.json

```
{  "functions": {    "api/test.php": {      "runtime": "vercel-php@0.5.2"    }  }}
```

In the example above, the `api/test.php` Serverless Function does not use one of the [officially supported runtimes](https://vercel.com/docs/functions/serverless-functions/runtimes). In turn, a `runtime` property was added in order to invoke the [vercel-php](https://www.npmjs.com/package/vercel-php) community runtime.