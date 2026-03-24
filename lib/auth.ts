import { jwtVerify, SignJWT } from 'jose';

export const getJwtSecretKey = () => {
    const secret = process.env.JWT_SECRET_KEY;
    if (!secret || secret.length === 0) {
        // For development fallback if env not set
        return new TextEncoder().encode('getbet-admin-super-secret-key-1234!!');
    }
    return new TextEncoder().encode(secret);
};

export async function verifyAuth(token: string) {
    try {
        const verified = await jwtVerify(token, getJwtSecretKey());
        return verified.payload as { id: string, role: string };
    } catch (err) {
        return null;
    }
}

export async function signAuth(payload: { id: string, role: string }) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(getJwtSecretKey());
}
