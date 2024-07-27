document.addEventListener('DOMContentLoaded', function() {
    displayOrderSummary();
    document.getElementById('checkout-form').addEventListener('submit', placeOrder);
    document.getElementById('payment-method').addEventListener('change', toggleCardDetails);
});

function displayOrderSummary() {
    const orderItems = document.getElementById('order-items');
    const subtotal = document.getElementById('subtotal');
    const total = document.getElementById('total');
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    orderItems.innerHTML = '';
    let cartSubtotal = 0;

    cart.forEach(item => {
        const itemPrice = typeof item.price === 'string' ? parseFloat(item.price.replace('$', '')) : item.price;
        const itemTotal = itemPrice * item.quantity;
        cartSubtotal += itemTotal;

        orderItems.innerHTML += `
            <div class="order-item">
                <span>${item.name} x${item.quantity}</span>
                <span>$${itemTotal.toFixed(2)}</span>
            </div>
        `;
    });

    const shippingCost = 5;
    const cartTotal = cartSubtotal + shippingCost;

    subtotal.textContent = `$${cartSubtotal.toFixed(2)}`;
    total.textContent = `$${cartTotal.toFixed(2)}`;
}

function placeOrder(e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const address = document.getElementById('address').value;
    const phone = document.getElementById('phone').value;
    const paymentMethod = document.getElementById('payment-method').value;

    let orderDetails = { name, address, phone, paymentMethod };

    if (paymentMethod === 'card') {
        orderDetails.cardNumber = document.getElementById('card-number').value;
        orderDetails.cardExpiry = document.getElementById('card-expiry').value;
        orderDetails.cardCVV = document.getElementById('card-cvv').value;
    }

    // Get cart items from localStorage
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Calculate total price
    const totalPrice = cartItems.reduce((total, item) => {
        const itemPrice = typeof item.price === 'string' ? parseFloat(item.price.replace('$', '')) : item.price;
        return total + (itemPrice * item.quantity);
    }, 0);

    // Prepare order data
    const orderData = {
        customerDetails: orderDetails,
        products: cartItems.map(item => ({
            productId: item._id, // Assuming each product has an _id
            name: item.name,
            price: typeof item.price === 'string' ? parseFloat(item.price.replace('$', '')) : item.price,
            quantity: item.quantity
        })),
        totalPrice: totalPrice,
        status: 'pending'
    };

    // Send order data to server
    fetch('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Order placed:', data);
        // Clear the cart
        localStorage.removeItem('cart');
        // Show a confirmation message
        alert('Thank you for your order! It will be processed soon.');
        // Redirect to the home page
        window.location.href = 'index.html';
    })
    .catch(error => {
        console.error('Error:', error);
        alert('There was an error processing your order. Please try again.');
    });
}

function toggleCardDetails() {
    const paymentMethod = document.getElementById('payment-method').value;
    const cardDetails = document.getElementById('card-details');

    if (paymentMethod === 'card') {
        cardDetails.style.display = 'block';
        setTimeout(() => {
            cardDetails.classList.add('show');
        }, 10); // Small delay to ensure the display change has taken effect
    } else {
        cardDetails.classList.remove('show');
        setTimeout(() => {
            cardDetails.style.display = 'none';
        }, 300); // Wait for the transition to finish before hiding the element
    }
}