import {defineConfig, loadEnv} from 'vite'
import path from "path"
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'
import { rimraf } from 'rimraf';
import {trimEnd as _trimEnd} from "lodash-es";
const removeMSW = () => ({
  name: 'remove-msw',
  closeBundle: async () => {
    await rimraf(path.join(__dirname, 'dist', 'mockServiceWorker.js'));
  },
});
// https://vitejs.dev/config/
export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxy_api = env.VITE_API || `${_trimEnd(env.VITE_BASE,'/')}/api/`
  const port = env.VITE_DEV_PORT || undefined;
  const remote_api = env.VITE_API_REMOTE_HOST || undefined;
  return {
    plugins: [react(),tailwindcss(),removeMSW()],
    base : './',
    build : {
      manifest  : "manifest.json"
    },
    server : {
      host : '0.0.0.0',
      port : port ? parseInt(port) : undefined,
      cors : {
        "origin": "*",
        "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
        "preflightContinue": false,
        "optionsSuccessStatus": 204
      },
      hmr  : {
        // clientPort : 5173
      },
      proxy : {
        [proxy_api]: {
          target : '0.0.0.0',
          // changeOrigin : true,
          configure(proxy){
            const old = proxy.web;

            proxy.web = (req,res,options,callback) => {
              const rewrites  : any= {
                'romantic-meerkat-cuddly.ngrok-free.app' : 'ttt.local.vtoshop.com'
              }
              const host= remote_api || req.headers.host!.replace(/:\d+/,':'+(env.VITE_API_PORT || '80'));
              const remoteHost = rewrites[host]||host;
              const target = `http://${remoteHost}`;
              console.log('proxy api:',target,req.url);
              const opts = {
                ...options,
                target,
              };
              req.headers.host = host;
              return old.call(proxy,req,res,opts);
            };
          }
        }
      }
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@hooks" : path.resolve(__dirname, "./src/hooks"),
        "@components": path.resolve(__dirname, "./src/components"),
        "@lib": path.resolve(__dirname, "./src/lib"),
        "@utils": path.resolve(__dirname, "./src/utils"),
        "@query": path.resolve(__dirname,"./src/query/"),
      },
    },
  };
})
