import { NextResponse } from 'next/server';

export async function POST() {
    return NextResponse.json({
        success: true,
        redirectUrl: 'https://easypaisa.mock.com/checkout?token=mock_ep_token',
        message: 'Easypaisa API initialized successfully (Mocked)',
    });
}
