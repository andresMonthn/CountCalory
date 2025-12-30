import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';
import { sendEmail } from '../utils/sendEmail.js';

const router = express.Router();

// @desc    Status check for Auth Routes
// @route   GET /api/auth/
// @access  Public
router.get('/', (req, res) => {
    res.json({
        message: 'Auth Service is running',
        endpoints: {
            login: 'POST /login (Magic Link)',
            loginPassword: 'POST /login-password'
        }
    });
});

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod', {
    expiresIn: '30d',
  });
};

// @desc    Auth user with password
// @route   POST /api/auth/login-password
// @access  Public
router.post('/login-password', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contraseña son requeridos' });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        email: user.email,
        hasPassword: true,
        token: generateToken(user._id),
      });
    } else {
      // Check if user exists but has no password (magic link user)
      if (user && !user.password) {
        return res.status(401).json({ message: 'Esta cuenta usa acceso por enlace mágico (sin contraseña).' });
      }
      res.status(401).json({ message: 'Email o contraseña inválidos' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Auth user & send magic link
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    // 1. Find or Create User
    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      user = await User.create({
        email: email.toLowerCase(),
      });
    }

    // 2. Generate Magic Token (random string)
    const loginToken = crypto.randomBytes(32).toString('hex');
    const loginTokenExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // 3. Save hashed token to DB (For simplicity in this step, saving plain, but should hash in prod)
    user.loginToken = loginToken;
    user.loginTokenExpires = loginTokenExpires;
    await user.save();

    // 4. Construct Link
    // Assuming client runs on port 5173 or 3000. Need to make this configurable.
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'; 
    const loginUrl = `${clientUrl}/verify?token=${loginToken}&email=${email}`;

    // 5. Send Email
    // Prioritize Nodemailer as requested, fallback to Resend API logic if needed or removed entirely.
    // We will use the new robust sendEmail utility.
    
    const magicLinkHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Inicia Sesión en CountCalory</title>
            </head>
            <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f1f5f9;">
                    <tr>
                        <td style="padding: 40px 20px;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); overflow: hidden;">
                                <!-- Header -->
                                <tr>
                                    <td style="padding: 30px 40px; background-color: #0f172a; text-align: center;">
                                        <h1 style="margin: 0; color: #22c55e; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">CountCalory</h1>
                                        <p style="margin: 5px 0 0; color: #94a3b8; font-size: 14px;">Tu asistente personal de nutrición</p>
                                    </td>
                                </tr>
                                
                                <!-- Content -->
                                <tr>
                                    <td style="padding: 40px 40px 30px;">
                                        <h2 style="margin: 0 0 20px; color: #1e293b; font-size: 24px; font-weight: 600; text-align: center;">¡Bienvenido de nuevo! 👋</h2>
                                        <p style="margin: 0 0 25px; color: #475569; font-size: 16px; line-height: 1.6; text-align: center;">
                                            Has solicitado iniciar sesión en tu cuenta. Para continuar y acceder a tu plan alimentario, simplemente haz clic en el botón mágico de abajo.
                                        </p>
                                        
                                        <!-- Button -->
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                            <tr>
                                                <td style="text-align: center;">
                                                    <a href="${loginUrl}" style="display: inline-block; padding: 16px 36px; background-color: #22c55e; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 50px; box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3); transition: background-color 0.3s ease;">
                                                        ✨ Iniciar Sesión Ahora
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <p style="margin: 30px 0 0; color: #64748b; font-size: 14px; line-height: 1.5; text-align: center;">
                                            O copia y pega este enlace en tu navegador:<br>
                                            <a href="${loginUrl}" style="color: #22c55e; word-break: break-all; text-decoration: none;">${loginUrl}</a>
                                        </p>
                                    </td>
                                </tr>
                                
                                <!-- Footer -->
                                <tr>
                                    <td style="padding: 30px 40px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
                                        <p style="margin: 0 0 10px; color: #94a3b8; font-size: 12px;">
                                            Si no solicitaste este correo, puedes ignorarlo de forma segura.<br>Este enlace expirará en 10 minutos.
                                        </p>
                                        <p style="margin: 0; color: #cbd5e1; font-size: 12px;">
                                            &copy; ${new Date().getFullYear()} CountCalory. Todos los derechos reservados.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            `;

    try {
        await sendEmail({
            to: email,
            subject: '🔐 Tu enlace mágico de acceso a CountCalory',
            html: magicLinkHtml
        });
        
        console.log(`✅ Email sent via Nodemailer to ${email}`);
        return res.status(200).json({ message: 'Email sent successfully' });

    } catch (error) {
        console.error('❌ Failed to send email via Nodemailer:', error);
        
        // Return helpful error
        return res.status(500).json({ 
            message: 'Error sending email',
            error: error.message,
            hint: 'Check server logs for SMTP details.'
        });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Verify magic link token
// @route   POST /api/auth/verify
// @access  Public
router.post('/verify', async (req, res) => {
    const { email, token } = req.body;

    try {
        const user = await User.findOne({ 
            email: email.toLowerCase(),
            loginToken: token,
            loginTokenExpires: { $gt: Date.now() }
        }).select('+password');

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Clear token
        user.loginToken = undefined;
        user.loginTokenExpires = undefined;
        await user.save();

        // Generate JWT Session Token
        const authToken = generateToken(user._id);

        res.json({
            _id: user._id,
            email: user.email,
            hasPassword: !!user.password,
            token: authToken,
            weight: user.weight,
            height: user.height,
            age: user.age,
            activityLevel: user.activityLevel
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


// @desc    Get User Profile
// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('+password');
        if (user) {
            res.json({
                _id: user._id,
                email: user.email,
                weight: user.weight,
                height: user.height,
                age: user.age,
                activityLevel: user.activityLevel,
                hasPassword: !!user.password
            });
        } else {
            res.status(404).json({ message: 'Usuario no encontrado' });
        }
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

// @desc    Update User Profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
    try {
        const { weight, height, age, activityLevel } = req.body;

        // Manual validation for types (sanitization/validation layer)
        if (weight !== undefined && (isNaN(weight) || weight < 0)) {
             return res.status(400).json({ message: 'Peso inválido' });
        }
        if (height !== undefined && (isNaN(height) || height < 0)) {
             return res.status(400).json({ message: 'Altura inválida' });
        }
        if (age !== undefined && (isNaN(age) || age < 0)) {
             return res.status(400).json({ message: 'Edad inválida' });
        }

        const user = await User.findById(req.user._id);

        if (user) {
            // Explicit assignment to prevent mass assignment of restricted fields
            if (weight !== undefined) user.weight = weight;
            if (height !== undefined) user.height = height;
            if (age !== undefined) user.age = age;
            if (activityLevel !== undefined) user.activityLevel = activityLevel;

            try {
                const updatedUser = await user.save();
                res.json({
                    _id: updatedUser._id,
                    email: updatedUser.email,
                    token: generateToken(updatedUser._id),
                    weight: updatedUser.weight,
                    height: updatedUser.height,
                    age: updatedUser.age,
                    activityLevel: updatedUser.activityLevel
                });
            } catch (validationError) {
                // Handle Mongoose validation errors
                if (validationError.name === 'ValidationError') {
                    const messages = Object.values(validationError.errors).map(val => val.message);
                    return res.status(400).json({ message: messages.join(', ') });
                }
                throw validationError;
            }
        } else {
            res.status(404).json({ message: 'Usuario no encontrado' });
        }
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: 'Error del servidor al guardar perfil' });
    }
});

// @desc    Update user password
// @route   PUT /api/auth/update-password
// @access  Private
router.put('/update-password', protect, async (req, res) => {
  const { password } = req.body;

  if (!password || password.length < 8) {
    return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres' });
  }

  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    user.password = password;
    await user.save();

    res.json({ 
      message: 'Contraseña actualizada correctamente',
      hasPassword: true 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar contraseña' });
  }
});

export default router;
