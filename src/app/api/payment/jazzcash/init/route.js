import { NextResponse } from 'next/server';

export async function POST() {
    return NextResponse.json({
        success: true,
        redirectUrl: 'https://jazzcash.mock.com/checkout?token=mock_jc_token',
        message: 'Jazzcash API initialized successfully (Mocked)',
    });
}
