import Stripe from 'stripe';
import admin from 'firebase-admin';

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

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
    try {
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
    } catch (error) {
        console.error('Error handling webhook:', error);
        return res.status(500).json({ error: 'Webhook handler failed' });
    }

    res.json({ received: true });
}

async function handleCheckoutComplete(session) {
    console.log('✅ Checkout completed:', session.id);
    
    const userId = session.client_reference_id;
    const customerId = session.customer;
    const subscriptionId = session.subscription;
    
    if (!userId) {
        console.error('No userId found in session');
        return;
    }

    try {
        // Update user's subscription in Firestore
        await db.collection('users').doc(userId).set({
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            subscriptionStatus: 'active',
            subscriptionStartDate: admin.firestore.FieldValue.serverTimestamp(),
            plan: session.amount_total === 1900 ? 'monthly' : session.amount_total === 14900 ? 'yearly' : 'lifetime',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        console.log('✅ User subscription activated:', userId);
    } catch (error) {
        console.error('Error updating Firestore:', error);
        throw error;
    }
}

async function handleSubscriptionUpdate(subscription) {
    console.log('🔄 Subscription updated:', subscription.id);
    
    try {
        // Find user by subscription ID
        const usersSnapshot = await db.collection('users')
            .where('stripeSubscriptionId', '==', subscription.id)
            .limit(1)
            .get();

        if (usersSnapshot.empty) {
            console.error('No user found for subscription:', subscription.id);
            return;
        }

        const userId = usersSnapshot.docs[0].id;
        
        // Update subscription status
        await db.collection('users').doc(userId).update({
            subscriptionStatus: subscription.status,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log('✅ Subscription status updated:', userId, subscription.status);
    } catch (error) {
        console.error('Error updating subscription:', error);
        throw error;
    }
}

async function handleSubscriptionCanceled(subscription) {
    console.log('❌ Subscription canceled:', subscription.id);
    
    try {
        // Find user by subscription ID
        const usersSnapshot = await db.collection('users')
            .where('stripeSubscriptionId', '==', subscription.id)
            .limit(1)
            .get();

        if (usersSnapshot.empty) {
            console.error('No user found for subscription:', subscription.id);
            return;
        }

        const userId = usersSnapshot.docs[0].id;
        
        // Mark subscription as canceled
        await db.collection('users').doc(userId).update({
            subscriptionStatus: 'canceled',
            subscriptionEndDate: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log('✅ Subscription marked as canceled:', userId);
    } catch (error) {
        console.error('Error canceling subscription:', error);
        throw error;
    }
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
