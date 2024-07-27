class NotificationSystem {
    constructor() {
        this.container = document.createElement('div');
        this.container.className = 'notification-container';
        document.body.appendChild(this.container);
    }

    show(message, type = 'success', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            ${message}
            <button class="notification-close">&times;</button>
        `;

        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => this.hide(notification));

        this.container.appendChild(notification);

        setTimeout(() => this.hide(notification), duration);
    }

    hide(notification) {
        notification.style.animation = 'fadeOut 0.5s ease-out';
        setTimeout(() => {
            this.container.removeChild(notification);
        }, 500);
    }
}

const notificationSystem = new NotificationSystem();