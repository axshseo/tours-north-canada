import { NextResponse } from 'next/server'
// import Stripe from 'stripe'

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: '2023-10-16' as any,
// })

export async function POST(request: Request) {
  try {
    const { lockId, amount } = await request.json()

    if (!lockId || !amount) {
      return NextResponse.json({ error: 'Missing lockId or amount' }, { status: 400 })
    }

    // In a real application, you'd fetch the exact lock/experience from the DB to verify the amount
    // to prevent client-side manipulation of the price.
    // For this demonstration, we are bypassing the Stripe initialization to allow it to compile without the SDK.
    
    /*
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // convert to cents
      currency: 'cad',
      metadata: { lockId },
      automatic_payment_methods: { enabled: true },
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
    */

    return NextResponse.json({ 
      clientSecret: 'mock_secret_for_demo_purposes',
      message: 'Stripe is mocked. Install stripe to enable live functionality.' 
    })

  } catch (err: any) {
    console.error('Server error creating payment intent:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
