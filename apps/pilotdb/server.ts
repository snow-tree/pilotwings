import 'zone.js/dist/zone-node';
import { ngExpressEngine } from '@nguniversal/express-engine';
import { join, resolve } from 'path';
import { AppServerModule } from './src/main.server';
import { APP_BASE_HREF } from '@angular/common';
import { existsSync } from 'fs';
import { parseBasicPilotCsv } from './src/faa-csv-db-parser';
import { maybe } from 'typescript-monads';
import * as express from 'express';
import * as postgres from 'postgres'

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  const distFolder = join(process.cwd(), 'dist/apps/pilotdb/browser');
  const indexHtml = existsSync(join(distFolder, 'index.original.html')) ? 'index.original.html' : 'index';
  const db = postgres({
    port: maybe(process.env.APP_DB_PORT).map(a => +a).valueOrThrow(),
    password: process.env.APP_DB_PASSWORD,
    user: process.env.APP_DB_USER,
    db: process.env.APP_DB_NAME,
  })

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const upload = require('multer')({ dest: 'uploads/' })

  // Our Universal express-engine (found @ https://github.com/angular/universal/tree/master/modules/express-engine)
  server.engine('html', ngExpressEngine({
    bootstrap: AppServerModule,
  }));

  function chunkItems<T>(items: T[], size: number) {
    return items.reduce((chunks: T[][], item: T, index) => {
      const chunk = Math.floor(index / size);
      chunks[chunk] = ([] as T[]).concat(chunks[chunk] || [], item);
      return chunks;
    }, []);
  }

  server.post('/pilot_basic', upload.single('file'), (req, res) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parseBasicPilotCsv(resolve((req as any).file.path)).then(a => {
      res.send()

      const all = chunkItems(Object.values(a), 5000).map(chunks => {
        return db`INSERT INTO "Pilots" ${db(chunks)}
                  ON CONFLICT ("id") DO UPDATE SET
                    "firstAndMiddleName" = excluded."firstAndMiddleName",
                    "lastName" = excluded."lastName";`
          .catch(console.log)
      })

      Promise.all(all)
    })
  })

  server.set('view engine', 'html');
  server.set('views', distFolder);

  server.get('/search', (req, res) => {
    const q = maybe<string>(req.query.q as string).map(b => b.toUpperCase()).valueOrNull()
    db`SELECT * FROM (
      SELECT "name", "state", similarity("name", ${q}) AS sml
        FROM "Pilots"
        WHERE ${q} <% "name"
        ORDER BY sml DESC, "name"
      ) AS d
      WHERE "sml" > 0.20
      LIMIT 50;
    `.then(a => {
      res.setHeader('Cache-Control', `public, max-age=${60 * 60 * 24 * 3}`)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      res.send(a.map(({ sml, ...others }) => ({ ...others })))
    })
  })

  // Example Express Rest API endpoints
  // server.get('/api/**', (req, res) => { });
  // Serve static files from /browser
  server.get('*.*', express.static(distFolder, {
    maxAge: '1y'
  }));

  // All regular routes use the Universal engine
  server.get('*', (req, res) => {
    res.render(indexHtml, { req, providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }] });
  });

  return server;
}

function run(): void {
  const port = process.env.PORT || 4000;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

// Webpack will replace 'require' with '__webpack_require__'
// '__non_webpack_require__' is a proxy to Node 'require'
// The below code is to ensure that the server is run only when not requiring the bundle.
declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = mainModule && mainModule.filename || '';
if (moduleFilename === __filename || moduleFilename.includes('iisnode')) {
  run();
}

export * from './src/main.server';
