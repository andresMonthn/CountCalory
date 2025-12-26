import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    select: false, // Don't return by default
  },
  weight: {
    type: Number,
    default: null,
    min: [2, 'El peso debe ser al menos 2 kg'],
    max: [300, 'El peso no puede exceder 300 kg']
  },
  height: {
    type: Number,
    default: null,
    min: [50, 'La altura debe ser al menos 50 cm'],
    max: [250, 'La altura no puede exceder 250 cm']
  },
  age: {
    type: Number,
    default: null,
    min: [12, 'La edad debe ser al menos 12 años'],
    max: [120, 'La edad no puede exceder 120 años']
  },
  activityLevel: {
    type: String,
    enum: {
      values: ['sedentario', 'ligero', 'moderado', 'intenso', '', 'sedentary', 'light', 'moderate', 'active', 'very_active'],
      message: '{VALUE} no es un nivel de actividad válido'
    },
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  loginToken: {
    type: String,
    select: false, // Don't return by default
  },
  loginTokenExpires: {
    type: Date,
    select: false,
  }
});

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  // Only hash if password exists (for magic link users it might be null/undefined)
  if (this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
