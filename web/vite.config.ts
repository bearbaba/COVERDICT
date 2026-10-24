import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
// Match Vercel's same-origin RPC rewrite during local development.
export default defineConfig({
 plugins:[react()],
 server:{proxy:{'/genlayer-rpc':{
  target:'https://studio.genlayer.com',
  changeOrigin:true,
  rewrite:(path)=>path.replace(/^\/genlayer-rpc(?=\/|$)/,'/api'),
 }}},
 build:{outDir:'dist'},
});
