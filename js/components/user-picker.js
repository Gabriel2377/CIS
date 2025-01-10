Vue.component('user-picker', {
    template: html`
        <div class="modal" @click.self="$emit('close')">
            <div class="modal-content">
                <h3>Select profile</h3>
                <div class="font-list">
                    <div v-for="user in users"
                         :key="user.id"
                         class="font-option"
                         @click="selectUser(user)">
                        {{ user.name }}
                    </div>
                </div>
                <button @click="$emit('close')">Close</button>
            </div>
        </div>
    `,
    data() {
        return {
            users: []
        };
    },

    async created() {
        this.users = await DatabaseService.getUsers();
        //if no users, go to onboarding
        if (!this.users.length) {
            this.$emit('switch-view', 'user-onboarding');
        }
    },

    methods: {
        selectUser(user) {
            sessionStorage.setItem('currentUser', JSON.stringify(user));
            state.currentUser = user;
            this.$emit('user-selected');
        }
    }

});