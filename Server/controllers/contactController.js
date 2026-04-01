const sendEmail = require('../utils/sendEmail');

const sendContactForm = async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        await sendEmail({
            email: process.env.ADMIN_EMAIL,
            subject: `[KB Feedback] ${subject}`,
            html: `
                <h2>New Feedback / Inquiry</h2>
                <p><strong>From:</strong> ${name} (${email})</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <hr/>
                <p style="white-space: pre-line;">${message}</p>
            `
        });

        res.status(200).json({ message: 'Your message has been sent!' });
    } catch (error) {
        console.error('Contact form email failed:', error);
        res.status(500).json({ message: 'Failed to send message. Please try again.' });
    }
};

module.exports = { sendContactForm };
