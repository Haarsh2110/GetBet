import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/backend/config/db';
import User from '@/backend/models/user';
import Otp from '@/backend/models/otp';
import { signAuth, verifyAuth } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function login(req: NextRequest) {
    try {
        const { phone, password, otp } = await req.json();

        if (!phone || (!password && !otp)) {
            return NextResponse.json({ success: false, error: 'Phone and Password/OTP are required' }, { status: 400 });
        }

        await connectDB();

        const user = await User.findOne({ phone });

        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        if (password) {
            if (!user.password) {
                return NextResponse.json({ success: false, error: 'No password set. Please use OTP to login.' }, { status: 400 });
            }
            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) {
                return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 });
            }
        } else if (otp) {
            const otpRecord = await Otp.findOne({ phone, otp });
            if (!otpRecord || otpRecord.expiresAt < new Date()) {
                return NextResponse.json({ success: false, error: 'Invalid or expired OTP' }, { status: 401 });
            }
            await Otp.deleteOne({ _id: otpRecord._id });
        }

        const token = await signAuth({ 
            id: user.userId, 
            role: user.role || 'user' 
        });

        const response = NextResponse.json({
            success: true,
            user: {
                id: user.userId,
                phone: user.phone,
                name: user.name,
                role: user.role
            }
        });

        response.cookies.set('user_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60,
            path: '/',
        });

        return response;

    } catch (err: any) {
        console.error('[LOGIN_ERROR]', err);
        return NextResponse.json({ success: false, error: 'Authentication failed' }, { status: 500 });
    }
}

export async function register(req: NextRequest) {
    try {
        const { phone, otp, password } = await req.json();

        // Professional Validation Block
        if (!phone || !otp || !password) {
            return NextResponse.json({ success: false, error: 'All fields are required' }, { status: 400 });
        }

        if (phone.length < 10) {
            return NextResponse.json({ success: false, error: 'Please enter a valid phone number' }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ success: false, error: 'Password must be at least 6 characters' }, { status: 400 });
        }

        await connectDB();

        const otpRecord = await Otp.findOne({ phone, otp });
        if (!otpRecord || otpRecord.expiresAt < new Date()) {
            return NextResponse.json({ success: false, error: 'Invalid or expired OTP' }, { status: 401 });
        }

        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            return NextResponse.json({ success: false, error: 'This phone number is already registered' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 8);

        const user = await User.create({
            userId: `user_${Date.now()}`,
            name: `Player_${phone.slice(-4)}`,
            email: `${phone}@getbet.vip`,
            phone: phone,
            password: hashedPassword,
            mainBalance: 0,
            status: 'active',
            role: 'user'
        });

        await Otp.deleteOne({ _id: otpRecord._id });
        const token = await signAuth({ id: user.userId, role: user.role });

        const response = NextResponse.json({
            success: true,
            user: { id: user.userId, name: user.name, phone: user.phone }
        });

        response.cookies.set('user_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60,
            path: '/',
        });

        return response;

    } catch (err: any) {
        console.error('[REGISTER_ERROR]', err);
        return NextResponse.json({ success: false, error: 'Registration failed' }, { status: 500 });
    }
}

export async function sendOtp(req: NextRequest) {
    try {
        const { phone } = await req.json();

        if (!phone || phone.length < 10) {
            return NextResponse.json({ success: false, error: 'Invalid phone number' }, { status: 400 });
        }

        await connectDB();

        // 1. Check if user already exists BEFORE sending OTP for registration flow
        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            return NextResponse.json({ 
                success: false, 
                error: 'Account already exists. Please login instead.'  
            }, { status: 400 });
        }

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        await Otp.findOneAndUpdate(
            { phone },
            { otp: otpCode, expiresAt },
            { upsert: true, new: true }
        );

        console.log(`[AUTH] REGISTRATION OTP for ${phone}: ${otpCode}`);

        return NextResponse.json({ 
            success: true, 
            message: 'OTP sent successfully',
            otp: otpCode 
        });

    } catch (err: any) {
        console.error('[SEND_OTP_ERROR]', err);
        return NextResponse.json({ success: false, error: 'Failed to send OTP' }, { status: 500 });
    }
}

export async function getCurrentUser(req: NextRequest) {
    try {
        const token = req.cookies.get('user_token')?.value;

        if (!token) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = await verifyAuth(token);
        if (!decoded) {
            return NextResponse.json({ success: false, error: 'Invalid or expired session' }, { status: 401 });
        }

        await connectDB();
        const user = await User.findOne({ userId: decoded.id });

        if (!user) {
            return NextResponse.json({ success: false, error: 'User data not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            user: {
                id: user.userId,
                phone: user.phone,
                name: user.name,
                role: user.role,
                mainBalance: (user as any).mainBalance,
                vipPlan: user.vipPlan
            }
        });

    } catch (err: any) {
        console.error('[AUTH_ME_ERROR]', err);
        return NextResponse.json({ success: false, error: 'Failed to fetch user session' }, { status: 500 });
    }
}

export async function logout() {
    try {
        const response = NextResponse.json({
            success: true,
            message: 'Logged out successfully'
        });

        response.cookies.set('user_token', '', {
            httpOnly: true,
            expires: new Date(0),
            path: '/',
        });

        return response;
    } catch (err: any) {
        console.error('[LOGOUT_ERROR]', err);
        return NextResponse.json({ success: false, error: 'Logout failed' }, { status: 500 });
    }
}
