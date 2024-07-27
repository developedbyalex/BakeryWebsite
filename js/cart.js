document.addEventListener('DOMContentLoaded', function() {
    displayCart();
    document.getElementById('apply-discount').addEventListener('click', applyDiscount);
});

let discountPercentage = 0;

function displayCart() {
    const cartItems = document.querySelector('.cart-items');
    const subtotal = document.getElementById('subtotal');
    const discountLine = document.getElementById('discount-line');
    const discountAmount = document.getElementById('discount-amount');
    const total = document.getElementById('total');
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    cartItems.innerHTML = '';
    let cartSubtotal = 0;

    cart.forEach(item => {
        const itemPrice = typeof item.price === 'string' ? parseFloat(item.price.replace('$', '')) : item.price;
        const itemTotal = itemPrice * item.quantity;
        cartSubtotal += itemTotal;

        cartItems.innerHTML += `
            <div class="cart-item"> 
                <img src="${item.image}" alt="${item.name}">
                <div class="item-details">
                    <h3>${item.name}</h3>
                    <p class="item-price">$${itemPrice.toFixed(2)}</p>
                </div>
                <div class="item-quantity">
                    <button class="quantity-btn minus" data-name="${item.name}">-</button>
                    <input type="number" value="${item.quantity}" min="1" readonly>
                    <button class="quantity-btn plus" data-name="${item.name}">+</button>
                </div>
                <button class="remove-item" data-name="${item.name}">Remove</button>
            </div>
        `;
    });

    const discount = cartSubtotal * (discountPercentage / 100);
    const shippingCost = 5;
    const cartTotal = cartSubtotal - discount + shippingCost;

    subtotal.textContent = `$${cartSubtotal.toFixed(2)}`;
    
    if (discountPercentage > 0) {
        discountAmount.textContent = `-$${discount.toFixed(2)}`;
        discountLine.style.display = 'flex';
    } else {
        discountLine.style.display = 'none';
    }
    
    total.textContent = `$${cartTotal.toFixed(2)}`;

    addCartListeners();
}

function addCartListeners() {
    const quantityButtons = document.querySelectorAll('.quantity-btn');
    const removeButtons = document.querySelectorAll('.remove-item');

    quantityButtons.forEach(button => {
        button.addEventListener('click', updateQuantity);
    });

    removeButtons.forEach(button => {
        button.addEventListener('click', removeItem);
    });
}

function updateQuantity(e) {
    const name = e.target.dataset.name;
    const isIncrement = e.target.classList.contains('plus');
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    const item = cart.find(item => item.name === name);
    if (item) {
        if (isIncrement) {
            item.quantity += 1;
        } else if (item.quantity > 1) {
            item.quantity -= 1;
        }
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart();
}

function removeItem(e) {
    const name = e.target.dataset.name;
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    cart = cart.filter(item => item.name !== name);

    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart();
    notificationSystem.show(`${name} removed from cart!`, 'error');
}

function applyDiscount() {
    const discountCodeInput = document.getElementById('discount-code');
    const discountCode = discountCodeInput.value;
    const discountMessage = document.getElementById('discount-message');

    if (discountCode.toLowerCase() === 'devroom10') {
        discountPercentage = 10;
        discountMessage.textContent = '10% discount applied!';
        discountMessage.style.color = '#4CAF50';
    } else {
        discountPercentage = 0;
        discountMessage.textContent = 'Invalid discount code.';
        discountMessage.style.color = '#f44336';
    }

    discountCodeInput.value = ''; // Clear the input field
    displayCart();
}