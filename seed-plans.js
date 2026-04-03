import { connectDB } from './backend/config/db';
import Plan from './backend/models/plan';

async function seed() {
    await connectDB();
    const starter = {
        planId: 'starter',
        name: 'Starter Plan',
        tagline: 'Casual player essentials for terminal access.',
        price: 999,
        oldPrice: 1499,
        durationDays: 30,
        vipBonus: 100000, // You can change this anytime from admin
        features: [
            'Basic Prediction Access',
            '10% Reversal Bonus',
            'Standard Customer Support',
            'Daily Tips & Tricks',
        ],
        isActive: true
    };

    await Plan.findOneAndUpdate({ planId: 'starter' }, starter, { upsert: true });
    console.log('Starter Plan seeded successfully');
    process.exit(0);
}

seed();
