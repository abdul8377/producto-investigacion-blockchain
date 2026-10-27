import type {NextConfig} from "next";
const nextConfig:NextConfig={
  // Datos privados: vistas de operador dinámicas, sin Cache Components.
  turbopack:{
    rules:{
      "*.css":{
        loaders:["@tailwindcss/turbopack"],
        as:"*.css",
      },
    },
  },
};
export default nextConfig;
