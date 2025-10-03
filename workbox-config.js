module.exports = {
	globDirectory: 'dist/',
	globPatterns: [
		'**/*.{html,js,css,svg,png,jpg,jpeg,gif,ico,woff,woff2,ttf,eot}'
	],
	swDest: 'dist/sw.js',
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/
	],
	runtimeCaching: [
		{
			urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
			handler: 'CacheFirst',
			options: {
				cacheName: 'google-fonts-cache',
				expiration: {
					maxEntries: 10,
					maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
				}
			}
		},
		{
			urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
			handler: 'CacheFirst',
			options: {
				cacheName: 'gstatic-fonts-cache',
				expiration: {
					maxEntries: 10,
					maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
				}
			}
		},
		{
			urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
			handler: 'CacheFirst',
			options: {
				cacheName: 'images-cache',
				expiration: {
					maxEntries: 60,
					maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
				}
			}
		}
	]
};