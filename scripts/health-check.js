const axios = require('axios');

const checkHealth = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/health', {
      timeout: 5000
    });
    console.log('✅ Health check passed:', response.data);
    process.exit(0);
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    process.exit(1);
  }
};

checkHealth();