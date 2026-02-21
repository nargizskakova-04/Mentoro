import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json(
                { message: 'Not authenticated' },
                { status: 401 }
            );
        }

        const decoded = await verifyJWT(token);

        if (!decoded || !decoded.userId) {
            return NextResponse.json(
                { message: 'Invalid token' },
                { status: 401 }
            );
        }

        const user = await db.user.findUnique({
            where: { id: decoded.userId },
        });

        if (!user) {
            return NextResponse.json(
                { message: 'User not found' },
                { status: 404 }
            );
        }

        const { password, ...userWithoutPassword } = user;

        return NextResponse.json(
            { user: userWithoutPassword },
            { status: 200 }
        );
    } catch (error) {
        console.error('Profile fetch error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
