document.addEventListener('DOMContentLoaded', function() {
    console.log('Wishlist script loaded');
    const wishlistGrid = document.getElementById('wishlist-grid');
    
    function displayWishlist() {
        console.log('Displaying wishlist');
        const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        console.log('Current wishlist:', wishlist);
        wishlistGrid.innerHTML = '';
        
        if (wishlist.length === 0) {
            wishlistGrid.innerHTML = '<p class="empty-wishlist">Your wishlist is empty.</p>';
            return;
        }

        wishlist.forEach(product => {
            const wishlistItem = document.createElement('div');
            wishlistItem.className = 'wishlist-item';
            wishlistItem.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="wishlist-item-footer">
                    <span class="wishlist-item-price">$${product.price.toFixed(2)}</span>
                    <button class="remove-from-wishlist" data-id="${product._id}">Remove</button>
                    <button class="add-to-cart" data-id="${product._id}">Add to Cart</button>
                </div>
            `;
            wishlistGrid.appendChild(wishlistItem);
        });
    }

    function removeFromWishlist(productId) {
        console.log('Removing from wishlist:', productId);
        let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        wishlist = wishlist.filter(product => product._id !== productId);
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        displayWishlist();
        if (typeof notificationSystem !== 'undefined') {
            notificationSystem.show('Product removed from wishlist', 'error');
        } else {
            console.error('Notification system not available');
        }
    }

    function addToCart(product) {
        console.log('Adding to cart:', product);
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItem = cart.find(item => item._id === product._id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                ...product,
                quantity: 1,
                price: parseFloat(product.price) // Ensure price is stored as a number
            });
        }
    
        localStorage.setItem('cart', JSON.stringify(cart));
        console.log('Updated cart:', cart);
        if (typeof notificationSystem !== 'undefined') {
            notificationSystem.show(`${product.name} added to cart!`, 'success');
        } else {
            console.error('Notification system not available');
        }
    }

    wishlistGrid.addEventListener('click', function(e) {
        console.log('Wishlist grid clicked', e.target);
        const productId = e.target.getAttribute('data-id');
        if (!productId) {
            console.log('No product ID found on clicked element');
            return;
        }

        const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        const product = wishlist.find(p => p._id === productId);

        if (e.target.classList.contains('remove-from-wishlist')) {
            removeFromWishlist(productId);
        } else if (e.target.classList.contains('add-to-cart')) {
            if (product) {
                addToCart(product);
            } else {
                console.error('Error: Product not found', productId);
                if (typeof notificationSystem !== 'undefined') {
                    notificationSystem.show('Error: Product not found', 'error');
                }
            }
        }
    });

    displayWishlist();
});