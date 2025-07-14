// book-ecommerce-frontend/next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https', // The protocol (http or https)
        hostname: 'picsum.photos', // The exact hostname
        // port: '', // No specific port for picsum.photos
        pathname: '/id/**', // This matches paths like /id/237/600/400
      },
      // If you add other external image sources later, you'd add similar objects here
      // {
      //   protocol: 'https',
      //   hostname: 'res.cloudinary.com',
      //   pathname: '/**', // Matches any path on cloudinary.com
      // },
    ],
  },
};

export default nextConfig;