import express from 'express';
import User from '../models/User.js';
import Summary from '../models/Summary.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Obtener métricas del usuario
// @route   GET /api/user/metrics
// @access  Private
router.get('/metrics', protect, async (req, res) => {
    try {
        const userId = req.user._id;

        // 1. Estadísticas Generales
        const summariesCount = await Summary.countDocuments({ userId });
        
        // 2. Actividad Mensual (Últimos 6 meses)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyActivityRaw = await Summary.aggregate([
            { 
                $match: { 
                    userId: userId, 
                    createdAt: { $gte: sixMonthsAgo } 
                } 
            },
            {
                $group: {
                    _id: { 
                        month: { $month: "$createdAt" }, 
                        year: { $year: "$createdAt" } 
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        // Formatear meses
        const monthlyActivity = monthlyActivityRaw.map(item => {
            const date = new Date(item._id.year, item._id.month - 1);
            return {
                month: date.toLocaleString('es-ES', { month: 'short' }),
                year: item._id.year,
                count: item.count
            };
        });

        // 3. Antigüedad de la cuenta
        const user = await User.findById(userId);
        const daysActive = Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24));

        res.json({
            summariesCount,
            monthlyActivity,
            daysActive,
            joinedDate: user.createdAt
        });

    } catch (error) {
        console.error('Error fetching metrics:', error);
        res.status(500).json({ message: 'Error al obtener métricas' });
    }
});

export default router;
