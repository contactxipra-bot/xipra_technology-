const http = require('http');

const commonPayload = {
  email: 'patelparthk6905@gmail.com',
  name: 'Parth Patel',
  teamName: 'TECH',
  teamNumber: 'HN-TECH01',
  domain: 'Software',
  memberCount: 2,
  totalFee: 600,
  perMember: 300,
  transactionId: 'N/A'
};

const sendEmail = (type) => {
  const payload = JSON.stringify({ ...commonPayload, type });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/send-email',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': payload.length
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log(`Response for ${type}:`, data);
    });
  });

  req.on('error', (error) => {
    console.error(`Error for ${type}:`, error);
  });

  req.write(payload);
  req.end();
};

sendEmail('registration');
setTimeout(() => sendEmail('approval'), 2000); // Wait 2s to not spam the server
