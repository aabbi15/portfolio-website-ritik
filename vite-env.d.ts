/// <reference types="vite/client" />

// Extending Vite's ServerOptions type to accept boolean for allowedHosts
declare module 'vite' {
    interface ServerOptions {
      allowedHosts?: boolean | true | string[] | undefined;
    }
  }