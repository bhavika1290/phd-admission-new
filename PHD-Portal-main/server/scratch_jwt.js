import jwt from 'jsonwebtoken';

async function testExportEndpoint() {
  try {
    const payload = {
      id: 'mock_id',
      email: '2023mcb1318@iitrpr.ac.in',
      isAdmin: true,
      role: 'SUPER_ADMIN'
    };
    // Need to read JWT_SECRET from .env
    import('dotenv').then(async ({ config }) => {
      config();
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
      console.log('Generated token');
      
      const res = await fetch('http://localhost:5001/api/export?status=undefined&category=undefined&eligibilityStatus=undefined&columns=name,email,category,research_area,eligibility,created_at', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) {
        const text = await res.text();
        console.error('Export failed:', res.status, text);
      } else {
        console.log('Export succeeded, status:', res.status);
      }
    });
  } catch (e) {
    console.error(e);
  }
}

testExportEndpoint();
