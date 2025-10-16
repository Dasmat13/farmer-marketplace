const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class PaymentService {
  constructor() {
    this.stripe = stripe;
  }

  async createPaymentIntent(amount, currency = 'usd', metadata = {}) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe expects amount in cents
        currency,
        metadata,
        automatic_payment_methods: {
          enabled: true
        }
      });

      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      };
    } catch (error) {
      console.error('Payment intent creation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async confirmPayment(paymentIntentId) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      
      return {
        success: true,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100, // Convert back to dollars
        currency: paymentIntent.currency
      };
    } catch (error) {
      console.error('Payment confirmation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async createRefund(paymentIntentId, amount = null) {
    try {
      const refundData = {
        payment_intent: paymentIntentId
      };

      if (amount) {
        refundData.amount = Math.round(amount * 100);
      }

      const refund = await this.stripe.refunds.create(refundData);

      return {
        success: true,
        refundId: refund.id,
        amount: refund.amount / 100,
        status: refund.status
      };
    } catch (error) {
      console.error('Refund creation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async createCustomer(email, name, address = null) {
    try {
      const customerData = { email, name };
      
      if (address) {
        customerData.address = address;
      }

      const customer = await this.stripe.customers.create(customerData);

      return {
        success: true,
        customerId: customer.id
      };
    } catch (error) {
      console.error('Customer creation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async handleWebhook(rawBody, signature) {
    try {
      const event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      console.log('Stripe webhook received:', event.type);

      switch (event.type) {
        case 'payment_intent.succeeded':
          return this.handlePaymentSuccess(event.data.object);
        case 'payment_intent.payment_failed':
          return this.handlePaymentFailure(event.data.object);
        case 'refund.created':
          return this.handleRefundCreated(event.data.object);
        default:
          console.log(`Unhandled webhook event type: ${event.type}`);
          return { success: true };
      }
    } catch (error) {
      console.error('Webhook handling error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async handlePaymentSuccess(paymentIntent) {
    console.log('Payment succeeded:', paymentIntent.id);
    
    // Here you would typically:
    // 1. Update order status in database
    // 2. Send confirmation email
    // 3. Trigger fulfillment process
    
    return { success: true, action: 'payment_succeeded' };
  }

  async handlePaymentFailure(paymentIntent) {
    console.log('Payment failed:', paymentIntent.id);
    
    // Here you would typically:
    // 1. Update order status to failed
    // 2. Send failure notification
    // 3. Log for manual review
    
    return { success: true, action: 'payment_failed' };
  }

  async handleRefundCreated(refund) {
    console.log('Refund created:', refund.id);
    
    // Here you would typically:
    // 1. Update order status to refunded
    // 2. Send refund confirmation
    // 3. Update inventory if needed
    
    return { success: true, action: 'refund_created' };
  }

  calculateProcessingFee(amount) {
    // Stripe's standard processing fee: 2.9% + 30¢
    const percentageFee = amount * 0.029;
    const fixedFee = 0.30;
    return Math.round((percentageFee + fixedFee) * 100) / 100;
  }

  validateAmount(amount, minAmount = 0.50) {
    return amount >= minAmount;
  }
}

module.exports = new PaymentService();
