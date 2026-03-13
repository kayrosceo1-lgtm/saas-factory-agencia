import type { NextConfig } from 'next'

const deployTarget = process.env.DEPLOY_TARGET || 'vercel'

const nextConfig: NextConfig = {
  // Activa el MCP server en /_next/mcp (Next.js 16+)
  experimental: {
    mcpServer: true,
  },

  // Standalone output para despliegues self-hosted (EasyPanel, Docker, VPS)
  // En Vercel no se necesita porque Vercel maneja su propio bundling
  ...(deployTarget !== 'vercel' && {
    output: 'standalone',
  }),
}

export default nextConfig
