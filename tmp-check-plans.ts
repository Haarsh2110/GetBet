import { connectDB } from './backend/config/db';
import Plan from './backend/models/plan';

async function check() {
    await connectDB();
    const plans = await Plan.find({});
    console.log(JSON.stringify(plans, null, 2));
    process.exit(0);
}
check();
