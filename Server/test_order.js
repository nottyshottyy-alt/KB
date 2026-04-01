async function testOrder() {
    try {
        const response = await fetch('http://localhost:5000/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                orderItems: [{
                    name: 'Test Product',
                    qty: 1,
                    image: '',
                    price: 1000,
                    product: '65f1a2b3c4d5e6f7a8b9c0d1' // Mock ObjectId
                }],
                shippingAddress: {
                    address: '123 Test St',
                    city: 'Test City',
                    country: 'Pakistan',
                    phone: '03001234567'
                },
                paymentMethod: 'Direct',
                itemsPrice: 1000,
                customerName: 'Test User',
                customerEmail: 'test@example.com'
            })
        });
        
        const data = await response.json();
        if (response.ok) {
            console.log('Success:', response.status, data);
        } else {
            console.log('Error:', response.status, JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.log('Error:', error.message);
    }
}

testOrder();
