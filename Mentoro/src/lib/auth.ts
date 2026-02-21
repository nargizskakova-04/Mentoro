import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'super-secret-key-for-dev';

export async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

export async function signJWT(payload: any): Promise<string> {
    return jwt.sign(payload, SECRET_KEY, { expiresIn: '1d' });
}

export async function verifyJWT(token: string): Promise<any> {
    try {
        return jwt.verify(token, SECRET_KEY);
    } catch (error) {
        return null; // Invalid token
    }
}
