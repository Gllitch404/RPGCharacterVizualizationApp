import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

function statePersistencePlugin(): Plugin {
  const saveFilePath = path.resolve(__dirname, 'campaign_state.json');

  return {
    name: 'state-persistence',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/api/save-state' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              fs.writeFileSync(saveFilePath, body, 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, savedAt: Date.now() }));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        if (req.url === '/api/load-state' && req.method === 'GET') {
          if (fs.existsSync(saveFilePath)) {
            try {
              const data = fs.readFileSync(saveFilePath, 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.end(data);
              return;
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message }));
              return;
            }
          } else {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ exists: false }));
            return;
          }
        }

        next();
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), statePersistencePlugin()],
  server: {
    port: 3000,
    open: true
  }
});
