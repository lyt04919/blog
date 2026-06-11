import { codeInspectorPlugin } from 'code-inspector-plugin'

const nextConfig = {
	devIndicators: false,
	reactStrictMode: false,
	pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
	typescript: {
		ignoreBuildErrors: true
	},
	experimental: {
		scrollRestoration: false
	},
	turbopack: {},
	webpack: config => {
		config.module.rules.push({
			test: /\.svg$/i,
			use: [{ loader: '@svgr/webpack', options: { svgo: false } }]
		})

		return config
	},

	async redirects() {
		return [
			{
				source: '/zh',
				destination: '/',
				permanent: true
			},
			{
				source: '/en',
				destination: '/',
				permanent: true
			}
		]
	}
}

export default nextConfig
