import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BlockLab | Investigación Blockchain",
  description: "Laboratorio de arquitectura híbrida blockchain para trazabilidad microcurricular."
};
export default function RootLayout({children}: Readonly<{children:React.ReactNode}>) {
  return <html lang="es"><body>{children}</body></html>;
}
