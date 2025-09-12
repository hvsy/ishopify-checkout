import {defineConfig, loadEnv} from 'vite'
import path from "path"
// import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'
import {rimraf} from 'rimraf';
import {trimEnd as _trimEnd} from "lodash-es";
import * as fs from "node:fs";

const removeMSW = () => ({
    name: 'remove-msw',
    closeBundle: async () => {
        await rimraf(path.join(__dirname, 'dist', 'mockServiceWorker.js'));
    },
});
// https://vitejs.dev/config/
export default defineConfig(({mode}) => {
    const env = loadEnv(mode, process.cwd(), '')
    const proxy_api = env.VITE_API || `${_trimEnd(env.VITE_BASE, '/')}/api/`
    const port = env.VITE_DEV_PORT || undefined;
    const remote_api = env.VITE_API_REMOTE_HOST || undefined;
    return {

        plugins: [react(),
            // tailwindcss(),
            removeMSW(),
            {
                name: 'inline-tailwind-css',
                apply: 'build',
                enforce: 'post',
                async transformIndexHtml(html,ctx) {
                    const bundles = ctx.bundle;
                    if (!bundles) {
                        return html;
                    }
                    // 找到后缀为 .css 的资源
                    const cssFiles = Object.values(bundles).filter(
                        (file : any) =>
                            file.type === 'asset' &&
                            file.fileName.endsWith('.css') && file.fileName.includes('index') &&
                            typeof file.source === 'string'
                    ) as any[];

                    if (cssFiles.length === 0) {
                        return html;
                    }

                    // 这里假设只有一个 CSS 文件（因为 cssCodeSplit: false）
                    const cssContent = cssFiles[0].source;
                    console.log(cssFiles[0].fileName);
                    return html.replace('<!-- inject:css -->',`<style>${cssContent}</style>`).replace(
                        `<link rel="stylesheet" crossorigin href="./${cssFiles[0].fileName}">`,''
                    );
                }
            }
        ],
        base: './',
        build: {
            manifest: "manifest.json",
        },
        content: ["./dist/**/*.{html,js}"],
        server: {
            host: '0.0.0.0',
            port: port ? parseInt(port) : undefined,
            // cors : {
            //   "origin": "*",
            //   "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
            //   "preflightContinue": false,
            //   "optionsSuccessStatus": 204
            // },
            cors: {
                origin: ['http://ttt.local.vtoshop.com:3000', 'https://localshopfly.myshopify.com'],
                credentials: true,
                "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
                "preflightContinue": false,
                "optionsSuccessStatus": 204
            },
            hmr: {
                // clientPort : 5173
            },
            proxy: {
                [proxy_api]: {
                    target: '0.0.0.0',
                    // changeOrigin : true,
                    configure(proxy) {
                        const old = proxy.web;

                        proxy.web = (req, res, options, callback) => {
                            const rewrites: any = {
                                'romantic-meerkat-cuddly.ngrok-free.app': 'ttt.local.vtoshop.com'
                            }
                            const host = remote_api || req.headers.host!.replace(/:\d+/, ':' + (env.VITE_API_PORT || '80'));
                            const remoteHost = rewrites[host] || host;
                            const target = `http://${remoteHost}`;
                            console.log('proxy api:', target, req.url);
                            const opts = {
                                ...options,
                                target,
                            };
                            req.headers.host = host;
                            return old.call(proxy, req, res, opts);
                        };
                    }
                }
            }
        },
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "./src"),
                "@hooks": path.resolve(__dirname, "./src/hooks"),
                "@components": path.resolve(__dirname, "./src/components"),
                "@lib": path.resolve(__dirname, "./src/lib"),
                "@utils": path.resolve(__dirname, "./src/utils"),
                "@query": path.resolve(__dirname, "./src/query/"),
            },
        },
    };
})
