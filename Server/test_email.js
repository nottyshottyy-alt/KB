const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });
const sendEmail = require('./utils/sendEmail');

async function runTest() {
    console.log('Testing email for:', process.env.SMTP_USER);
    try {
        await sendEmail({
            email: process.env.ADMIN_EMAIL,
            subject: 'Test Email from KB Store',
            html: '<h1>If you see this, email is working!</h1>'
        });
        console.log('Test completed successfully');
    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

runTest();
