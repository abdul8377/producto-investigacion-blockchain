import type {NextConfig} from "next";
const nextConfig:NextConfig={
  // Las vistas académicas privadas se evalúan por solicitud y no usan Cache Components.
  // El Gateway incorpora un módulo PKCS#11 OPCIONAL para HSM que Turbopack no debe empaquetar.
  // Usamos únicamente identidad X.509 y firma con clave privada de software.
  serverExternalPackages:["@hyperledger/fabric-gateway"],
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
