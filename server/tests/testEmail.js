import nodemailer from 'nodemailer';
import 'dotenv/config';

async function testEmail() {
    console.log('📧 Iniciando prueba de envío de correo...');
    console.log('----------------------------------------');
    console.log('Configuración detectada:');
    console.log('Host:', process.env.SMTP_HOST);
    console.log('Port:', process.env.SMTP_PORT);
    console.log('User:', process.env.SMTP_USER);
    console.log('Pass:', process.env.SMTP_PASS ? '********' : 'NO DEFINIDO');
    console.log('----------------------------------------');

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.error('❌ Faltan variables de entorno SMTP. Asegúrate de configurar .env correctamente.');
        return;
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('🔌 Verificando conexión SMTP...');
        await transporter.verify();
        console.log('✅ Conexión SMTP exitosa.');

        console.log('📨 Enviando correo de prueba...');
        const info = await transporter.sendMail({
            from: `"Test CountCalory" <${process.env.SMTP_USER}>`,
            to: "a.calvillo@distribuidoracymags.com.mx",
            subject: "🧪 Prueba de Conexión SMTP - CountCalory",
            text: "Si estás leyendo esto, la configuración de correo funciona correctamente.",
            html: "<b>Si estás leyendo esto, la configuración de correo funciona correctamente.</b>"
        });

        console.log('✅ Correo enviado correctamente!');
        console.log('Message ID:', info.messageId);

    } catch (error) {
        console.error('❌ Error fatal en la prueba:');
        console.error(error);
    }
}

testEmail();