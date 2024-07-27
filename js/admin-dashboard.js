document.addEventListener('DOMContentLoaded', function() {
    const productList = document.getElementById('product-list');
    const orderList = document.getElementById('order-list');
    const addProductBtn = document.getElementById('add-product-btn');
    const productModal = document.getElementById('product-modal');
    const productForm = document.getElementById('product-form');
    const closeModal = document.querySelector('.close');

    function fetchProducts() {
        fetch('http://localhost:3000/api/products')
            .then(response => response.json())
            .then(products => {
                productList.innerHTML = '';
                products.forEach(product => {
                    const productElement = document.createElement('div');
                    productElement.className = 'product-item';
                    productElement.innerHTML = `
                        <h3>${product.name}</h3>
                        <p>${product.description}</p>
                        <p>Price: $${product.price}</p>
                        <p>Category: ${product.category}</p>
                        <div class="product-actions">
                            <button class="edit-btn" data-id="${product._id}">Edit</button>
                            <button class="delete-btn" data-id="${product._id}">Delete</button>
                            <button class="feature-btn ${product.featured ? 'featured' : ''}" data-id="${product._id}">
                                ${product.featured ? 'Unfeature' : 'Feature'}
                            </button>
                        </div>
                    `;
                    productList.appendChild(productElement);
                });
            });
    }

    function fetchOrders() {
        fetch('http://localhost:3000/api/orders')
            .then(response => response.json())
            .then(orders => {
                orderList.innerHTML = '';
                orders.forEach(order => {
                    const orderElement = document.createElement('div');
                    orderElement.className = 'order-item';
                    orderElement.innerHTML = `
                        <div class="order-summary">
                            <h3>Order ID: ${order._id}</h3>
                            <p>Date: ${new Date(order.date).toLocaleString()}</p>
                            <p>Total: $${order.totalPrice.toFixed(2)}</p>
                            <p>Status: ${order.status}</p>
                            <button class="view-details-btn">View Details</button>
                        </div>
                        <div class="order-details">
                            <p>Customer: ${order.customerDetails.name}</p>
                            <p>Address: ${order.customerDetails.address}</p>
                            <p>Phone: ${order.customerDetails.phone}</p>
                            <p>Payment Method: ${order.customerDetails.paymentMethod}</p>
                            <h4>Products:</h4>
                            <ul>
                                ${order.products.map(product => `
                                    <li>${product.name} - $${product.price} x ${product.quantity}</li>
                                `).join('')}
                            </ul>
                            <div class="order-actions">
                                <button class="complete-btn" data-id="${order._id}" ${order.status === 'completed' ? 'disabled' : ''}>
                                    ${order.status === 'completed' ? 'Completed' : 'Mark as Complete'}
                                </button>
                                <button class="remove-btn" data-id="${order._id}">Remove Order</button>
                            </div>
                        </div>
                    `;
                    orderList.appendChild(orderElement);
                });
            });
    }

    function showModal(product = null) {
        if (product) {
            document.getElementById('product-id').value = product._id;
            document.getElementById('product-name').value = product.name;
            document.getElementById('product-description').value = product.description;
            document.getElementById('product-price').value = product.price;
            document.getElementById('product-category').value = product.category;
            document.getElementById('product-image').value = product.image;
        } else {
            productForm.reset();
            document.getElementById('product-id').value = '';
        }
        productModal.style.display = 'block';
    }

    function toggleFeatureProduct(productId) {
        fetch(`http://localhost:3000/api/products/${productId}/toggle-featured`, {
            method: 'PUT'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then((updatedProduct) => {
            const featureBtn = document.querySelector(`.feature-btn[data-id="${productId}"]`);
            if (featureBtn) {
                featureBtn.classList.toggle('featured');
                featureBtn.textContent = updatedProduct.featured ? 'Unfeature' : 'Feature';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to toggle feature status. Please try again.');
        });
    }

    productForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const productId = document.getElementById('product-id').value;
        const productData = {
            name: document.getElementById('product-name').value,
            description: document.getElementById('product-description').value,
            price: parseFloat(document.getElementById('product-price').value),
            category: document.getElementById('product-category').value,
            image: document.getElementById('product-image').value
        };

        const url = productId ? `http://localhost:3000/api/products/${productId}` : 'http://localhost:3000/api/products';
        const method = productId ? 'PUT' : 'POST';

        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData),
        })
        .then(response => response.json())
        .then(() => {
            productModal.style.display = 'none';
            fetchProducts();
        });
    });

    productList.addEventListener('click', function(e) {
        if (e.target.classList.contains('edit-btn')) {
            const productId = e.target.getAttribute('data-id');
            fetch(`http://localhost:3000/api/products/${productId}`)
                .then(response => response.json())
                .then(product => showModal(product));
        } else if (e.target.classList.contains('delete-btn')) {
            const productId = e.target.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this product?')) {
                fetch(`http://localhost:3000/api/products/${productId}`, { method: 'DELETE' })
                    .then(() => fetchProducts());
            }
        } else if (e.target.classList.contains('feature-btn')) {
            const productId = e.target.getAttribute('data-id');
            toggleFeatureProduct(productId);
        }
    });

    orderList.addEventListener('click', function(e) {
        if (e.target.classList.contains('view-details-btn')) {
            const orderItem = e.target.closest('.order-item');
            orderItem.classList.toggle('expanded');
            e.target.textContent = orderItem.classList.contains('expanded') ? 'Hide Details' : 'View Details';
        } else if (e.target.classList.contains('complete-btn')) {
            const orderId = e.target.getAttribute('data-id');
            fetch(`http://localhost:3000/api/orders/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: 'completed' }),
            })
            .then(() => fetchOrders());
        } else if (e.target.classList.contains('remove-btn')) {
            const orderId = e.target.getAttribute('data-id');
            if (confirm('Are you sure you want to remove this order?')) {
                fetch(`http://localhost:3000/api/orders/${orderId}`, { method: 'DELETE' })
                    .then(() => fetchOrders());
            }
        }
    });

    fetchProducts();
    fetchOrders();
});