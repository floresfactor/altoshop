//make sure to verify secret on each new install of ghost
export default {
  client_id: process.env.CLIENT_ID || '',
  client_secret: process.env.CLIENT_SECRET || ''
};