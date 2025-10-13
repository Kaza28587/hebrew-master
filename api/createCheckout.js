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
    const { priceId, userId } = req.body;

    if (!priceId) {
      return res.status(400).json({ error: 'Price ID is required' });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not set');
      return res.status(500).json({ error: 'Stripe is not configured' });
    }

    console.log('Creating checkout for price:', priceId);

    // Get the origin for success/cancel URLs
    const origin = req.headers.origin || 'https://hebrew-master-muab.vercel.app';

    // Create Stripe checkout session
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/dashboard.html?success=true`,
      cancel_url: `${origin}/pricing.html?canceled=true`,
      client_reference_id: userId || 'guest',
    });

    console.log('Checkout session created:', session.id);

    return res.status(200).json({ 
      sessionId: session.id,
      url: session.url 
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return res.status(500).json({ 
      error: 'Checkout creation failed',
      details: error.message 
    });
  }
}
