(async () => {
  const draftOrderId = 1228873957691
  try {
    const res = await fetch('http://localhost:3000/api/complete-draft-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ draftOrderId: draftOrderId, paymentDetails: { razorpay_payment_id: 'simulated' } })
    })
    const text = await res.text()
    console.log('Status:', res.status, res.statusText)
    console.log('Body:', text)
  } catch (err) {
    console.error('Error calling complete-draft-order:', err)
    process.exit(1)
  }
})()
