import Stripe from 'stripe';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        const sig = req.headers['stripe-signature'];
        const body = await getRawBody(req);
        
        event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            await handleCheckoutComplete(session);
            break;
        
        case 'customer.subscription.updated':
            const subscription = event.data.object;
            await handleSubscriptionUpdate(subscription);
            break;
        
        case 'customer.subscription.deleted':
            const canceledSubscription = event.data.object;
            await handleSubscriptionCanceled(canceledSubscription);
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
}

async function handleCheckoutComplete(session) {
    console.log('Checkout completed:', session.id);
    
    const userId = session.client_reference_id;
    const customerId = session.customer;
    const subscriptionId = session.subscription;
    
    // We'll add Firestore update in the next step
    console.log('User:', userId, 'Customer:', customerId, 'Subscription:', subscriptionId);
}

async function handleSubscriptionUpdate(subscription) {
    console.log('Subscription updated:', subscription.id);
    // We'll add Firestore update in the next step
}

async function handleSubscriptionCanceled(subscription) {
    console.log('Subscription canceled:', subscription.id);
    // We'll add Firestore update in the next step
}

// Helper to get raw body for webhook signature verification
async function getRawBody(req) {
    return new Promise((resolve, reject) => {
        let buffer = '';
        req.on('data', chunk => {
            buffer += chunk;
        });
        req.on('end', () => {
            resolve(Buffer.from(buffer));
        });
        req.on('error', reject);
    });
}
