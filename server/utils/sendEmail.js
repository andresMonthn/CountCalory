import nodemailer from 'nodemailer';

/**
 * Utility to send emails using Nodemailer
 * Includes retry logic and robust error handling for Vercel/Serverless environments
 */
export const sendEmail = async (options) => {
    // 1. Create Transporter
    // We create it inside the function to ensure fresh config/connection in serverless
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        tls: {
            rejectUnauthorized: false // Helps with some self-signed certs or proxy issues
        },
        // Pool configuration for efficiency, but careful with serverless timeouts
        pool: true, 
        maxConnections: 1,
        maxMessages: 5,
    });

    // 2. Define Email Options
    const mailOptions = {
        from: process.env.EMAIL_FROM || `"CountCalory" <${process.env.SMTP_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text, // Fallback plain text
    };

    // 3. Send with Retry Logic
    const maxRetries = 2;
    let attempt = 0;

    while (attempt <= maxRetries) {
        try {
            console.log(`📧 Attempting to send email to ${options.to} (Attempt ${attempt + 1}/${maxRetries + 1})...`);
            
            // Verify connection before sending (optional but good for debugging)
            if (attempt === 0) {
                 await transporter.verify();
                 console.log('✅ SMTP Connection verified');
            }

            const info = await transporter.sendMail(mailOptions);
            console.log(`✅ Email sent: ${info.messageId}`);
            return info;

        } catch (error) {
            attempt++;
            console.error(`❌ Email send failed (Attempt ${attempt}):`, error.message);

            if (attempt > maxRetries) {
                console.error('❌ All retry attempts failed.');
                throw new Error(`Email sending failed after ${maxRetries + 1} attempts: ${error.message}`);
            }

            // Wait briefly before retry (exponential backoff could be used here)
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
    }
};

export default sendEmail;
