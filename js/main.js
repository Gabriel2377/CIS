Vue.config.ignoredElements = [
    'feed-viewer'
];

const state = {
    currentView: 'user-onboarding',
    currentUser: null,
    posts: [],
    lists: [],
    editor: null,
    editorCurrentSelection: null
}

new Vue({
    el: '#app',
    data: {
        currentView: 'user-onboarding',
        currentUser: null,
        posts: []
    },
    async created() {
        this.$on('show-toast', this.showToast);
        // this.currentView = 'user-picker';

        // FORCE ONE USER FOR NOW

        this.currentView = 'feed-view';
        // const user =await DatabaseService.getCurrentUser() ||  await DatabaseService.initUser('testuser');
        const user = {
            id: 1,
            name: 'testuser',
            createdAt: Date.now()
        };
        state.currentUser = user;
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        setTimeout(() => {
            // this.$emit('user-selected');
            this.userSelected();
        }, 300);

    },
    methods: {

        async userSelected() {
            const user = await DatabaseService.getCurrentUser();
            state.currentUser = user;
            this.currentUser = user;
            this.currentView = 'feed-view';
            this.loadPosts();
        },

        showToast(message, duration) {
            this.$refs.toast.showToast(message, duration || 3000);
        },

        switchView(view) {
            this.currentView = view;
        },
        async loadPosts() {
            this.posts = await DatabaseService.getPosts(Number.MAX_SAFE_INTEGER);
        },
        async createdPost() {
            await this.loadPosts();
        },
        async likePost(postId) {
            // Handle liking posts
        }
    }
});