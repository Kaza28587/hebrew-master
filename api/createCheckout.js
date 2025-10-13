import Stripe from 'stripe';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { priceId, userId } = req.body;

        if (!priceId) {
            return res.status(400).json({ error: 'Price ID is required' });
        }

        const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
        if (!stripeSecretKey) {
            console.error('STRIPE_SECRET_KEY is not set');
            return res.status(500).json({ error: 'Stripe configuration error' });
        }

        const stripe = new Stripe(stripeSecretKey);

        console.log('Creating checkout for price:', priceId);

        // Get the domain for redirect URLs
        const domain = req.headers.host || 'hebrew-master-muab.vercel.app';
        const protocol = domain.includes('localhost') ? 'http' : 'https';

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
success_url: `${protocol}://${domain}/pricing.html?success=true&session_id={CHECKOUT_SESSION_ID}`,
cancel_url: `${protocol}://${domain}/pricing.html?cancelled=true`,
            client_reference_id: userId || 'guest',
            metadata: {
                userId: userId || 'guest'
            }
        });

        console.log('Checkout session created:', session.id);

        return res.status(200).json({ 
            sessionId: session.id,
            url: session.url 
        });

    } catch (error) {
        console.error('Checkout error:', error);
        return res.status(500).json({ 
            error: 'Failed to create checkout session',
            details: error.message 
        });
    }
}







