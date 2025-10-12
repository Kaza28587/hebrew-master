import Stripe from 'stripe';

export default async function handler(req, res) {
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
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { plan, email } = req.body;

    const prices = {
      premium: { amount: 1900, name: 'Premium Plan', recurring: true },
      lifetime: { amount: 19900, name: 'Lifetime Access', recurring: false }
    };

    const selected = prices[plan];
    const origin = req.headers.origin || req.headers.referer || 'https://hebrew-master.vercel.app';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: selected.name,
            description: 'Hebrew Master - AI Language Learning'
          },
          unit_amount: selected.amount,
          recurring: selected.recurring ? { interval: 'month' } : undefined
        },
        quantity: 1
      }],
      mode: selected.recurring ? 'subscription' : 'payment',
      success_url: `${origin}/dashboard.html?payment=success`,
      cancel_url: `${origin}/checkout.html?cancelled=true`,
      customer_email: email,
      metadata: { plan }
    });

    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: error.message });
  }
}