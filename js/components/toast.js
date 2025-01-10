Vue.component('toast', {
    template: `
        <div v-if="visible" class="toast">{{ message }}</div>
    `,
    data() {
        return {
            visible: false,
            message: '',
            timeout: null
        };
    },
    methods: {
        showToast(message, duration) {
            this.message = message;
            this.visible = true;
            clearTimeout(this.timeout);
            this.timeout = setTimeout(() => {
                this.visible = false;
            }, duration);
        }
    }
});