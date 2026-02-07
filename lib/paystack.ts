const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

export interface PaystackPaymentData {
    email: string;
    amount: number;
    reference: string;
    callback_url?: string;
    metadata?: {
        storeId: string;
        userId: string;
        plan: string;
        branches: number;
    };
}

export interface PaystackResponse {
    status: boolean;
    message: string;
    data: {
        authorization_url: string;
        access_code: string;
        reference: string;
    };
}

export class PaystackService {
    private static baseURL = 'https://api.paystack.co';

    static async initializePayment(paymentData: PaystackPaymentData): Promise<PaystackResponse> {
        const response = await fetch(`${this.baseURL}/transaction/initialize`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...paymentData,
                amount: paymentData.amount * 100, // Convert to kobo
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to initialize payment');
        }

        return response.json();
    }

    static async verifyPayment(reference: string) {
        const response = await fetch(`${this.baseURL}/transaction/verify/${reference}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to verify payment');
        }

        return response.json();
    }

    static generateReference(storeId: string): string {
        return `retail_${storeId}_${Date.now()}`;
    }
}