Vue.component('feed-view', {
    template: html`
    <div>
        <feed-viewer ref="feedViewer" v-longpress="showActionSheet">

            <div style="display: none" slot="panel" class="panel">
                <button v-if="postType==0" @click="setViewPostType"  class="fab"><i class="fas fa-book"></i></button>
                <button v-if="postType==1" @click="setViewPostType"  class="fab"><i class="fas fa-water"></i></button>
                <div v-if="canPost" class="fab-menu">
                    <button class="fab" @click="showOptionsMenu = !showOptionsMenu">
                        <i class="fas fa-cog"></i>
                    </button>
                    <div v-if="showOptionsMenu" class="format-options">
                        <button id="createPost" class="fab"><i class="fas fa-plus"></i></button>
                        <button id="editPost" class="fab"><i class="fas fa-pencil"></i></button>
                        <button id="removePost" class="fab"><i class="fas fa-trash"></i></button>                    
                    </div>
                </div>
            </div>

            <!-- <div v-if="canPost" slot="panel" class="panel">
                <button id="createPost" class="fab"><i class="fas fa-plus"></i></button>
                <button id="editPost" class="fab"><i class="fas fa-pencil"></i></button>
                <button id="removePost" class="fab"><i class="fas fa-trash"></i></button>
            </div> -->
            <div slot="post-content"></div>
        </feed-viewer>

        <!-- Action Sheet -->
        <div v-if="showActionSheetModal" class="modal" @click.self="showActionSheetModal = false">
            <div class="modal-content">
                <!-- <h3>Options</h3> -->
                
                <button @click="showAddPostWPINModal=1">Add post</button>
                <button @click="setPostType(0)">Set post as verse</button>
                <button @click="setPostType(1)">Set post as poetry</button>
                <hr style="border: 1px solid #5d5757">
                <button v-if="postType==0" @click="setViewPostType"  class="fab"><i class="fas fa-book"></i></button>
                <button v-if="postType==1" @click="setViewPostType"  class="fab"><i class="fas fa-water"></i></button>
                <button @click="createPost($event,0)" class="fab"><i class="fas fa-plus"></i></button>
                <button @click="editPost()" class="fab"><i class="fas fa-pencil"></i></button>
                <button @click="removePost($event,currentPost)" class="fab"><i class="fas fa-trash"></i></button>                    
                
                <!-- <button @click="exportPosts">Export Posts</button>
                <button @click="syncPosts">Sync Posts</button>
                <button @click="triggerFileInput">Import Posts</button>
                <input type="file" ref="fileInput" @change="importPosts" style="display: none;"> -->
            </div>
        </div>

        <!-- Add post w PIN -->
        <div v-if="showAddPostWPINModal" class="modal" @click.self="showAddPostWPINModal = false">
            <div class="modal-content">
                <h3>Add post with PIN</h3>
                <input v-model="SyncPIN" 
                       required
                       type="text"
                       placeholder="Enter PIN">

                <button @click="createPost($event, 1)">Ok</button>
                <!-- <button @click="exportPosts">Export Posts</button>
                <button @click="syncPosts">Sync Posts</button>
                <button @click="triggerFileInput">Import Posts</button>
                <input type="file" ref="fileInput" @change="importPosts" style="display: none;"> -->
            </div>
        </div>

        <!-- Save to List Modal -->
        <div v-if="showListModal" class="modal" @click.self="showListModal = false">
            <div class="modal-content">
                <h3>Save to List</h3>
                <div v-for="list in lists" :key="list.id">
                    <button @click="saveToList(list.id)">{{ list.name }}</button>
                </div>
                <input v-model="newListName" placeholder="New list name">
                <button @click="createNewList">Create New List</button>
            </div>
        </div>

        <!-- Sync posts Modal -->
        <div v-if="showSyncModal" class="modal" @click.self="showSyncModal = false">
            <div class="modal-content">
                <h3>Sync posts with PIN</h3>
                <input v-model="SyncPIN" 
                       type="text" 
                       placeholder="Enter PIN">
                <button @click="getSync">Receive</button>
                <button @click="sendSync">Send</button>
                <button @click="showSyncModal = false">Cancel</button>
            </div>
        </div>
    </div>
    `,
    props: ['posts'],
    data() {
        return {
            showActionSheetModal: false,
            showAddPostWPINModal: false,
            showListModal: false,
            lists: [],
            newListName: '',
            loadingOlder: false,
            loadingNewer: false,
            showSyncModal: false,
            SyncPIN: '',
            postsLastIndex: null,
            currentPost: {},
            showOptionsMenu: false,
            postType: 0
        };
    },

    computed: {

        canPost() {

            // Check if user is on mobile
            const isMobile = /Mobi|Android/i.test(navigator.userAgent);

            return !isMobile && localStorage.getItem('token') ? true : false;
        }

    },

    async created() {

        this.lists = await DatabaseService.getLists(state.currentUser.id);

        // Add click handler to close format menus when clicking outside
        document.addEventListener('click', this.handleClickOutside);

        // document.getElementById('feed-container').addEventListener('scrollsnapchange', this.handleScroll);

        //TODO: Add event listener for scroll
        // window.addEventListener('scroll', this.handleScroll);
    },

    mounted() {
        // get the feedViewer
        const feedViewer = this.$refs.feedViewer;
        //bind feedViewer exposed events
        feedViewer.addEventListener('loadData', this.loadData);
        feedViewer.addEventListener('error', this.handleError);
        feedViewer.addEventListener('postAction', this.handlePostAction);
        this.loadData({ detail: { direction: 'right' } });

    },

    beforeDestroy() {

        document.removeEventListener('click', this.handleClickOutside);

        //TODO: Remove event listener for scroll
        // window.removeEventListener('scroll', this.handleScroll);
    },
    methods: {

        setViewPostType() {
            this.postType = (this.postType + 1) % 2;
            state.currentPostViewType = this.postType;
        },

        handleClickOutside(event) {
            if (event.manual || !event.target.closest('.fab-menu')) {
                this.showFormatting = false;
                this.showAlignment = false;
                this.showMediaOptions = false;
                this.showFontSizeOptions = false;
            }
        },

        loadData(event) {
            const { direction, currentPostId } = event.detail;
            let dir = direction === 'left' ? 1 : -1;
            let pId = currentPostId ? currentPostId * dir : undefined;
            DatabaseService.getPosts(pId).then(async posts => {
                if (posts.length === 0) {
                    posts = dir < 0
                        ? await DatabaseService.getPosts(-1)
                        : await DatabaseService.getPosts();
                }
                this.currentPost = posts[0];
                this.$refs.feedViewer.displayPost(this.currentPost);
            });
        },

        setPostType(type) {
            this.currentPost.type = type;
            DatabaseService.setPostType(this.currentPost).then(() => {
                this.showActionSheetModal = false;
            });
        },

        handleError(event) {
            console.error('Error:', event.detail);
        },

        handlePostAction(event) {
            const { action, postId, postIndex } = event.detail;
            console.log(`${action} action triggered for post ${postId} at index ${postIndex}`);

            // on next tick to allow the click event to finish
            if (action == 'removePost') {
                this.$nextTick(() => {
                    this.currentPost && this.removePost(event, this.currentPost);
                });
            }
            else if (action == 'showActionSheet') {
                this.$nextTick(() => {
                    this.showActionSheet();
                });
            }
            else if (action == 'createPost') {
                this.$nextTick(() => {
                    this.createPost();
                });
            }
            else if (action == 'editPost') {
                this.$nextTick(() => {
                    this.editPost();
                });
            }

        },

        createPost(event, storePin) {
            this.handleClickOutside({ manual:true });

            if (storePin) localStorage.setItem('token', this.SyncPIN);

            state.currentPost = {};
            if (localStorage.getItem('token')) {
                this.$emit('switch-view', 'create-post');
            }
            else
                this.showActionSheet();
        },

        editPost(event, storePin) {
            this.handleClickOutside({ manual:true });

            if (storePin) localStorage.setItem('token', this.SyncPIN);
            if (localStorage.getItem('token')) {
                state.currentPost = this.currentPost;
                this.$emit('switch-view', 'create-post', this.currentPost.id);
            }
            // else
            //     this.showActionSheet();
        },

        async removePost(event, post) {
            this.handleClickOutside({ manual:true });
            try {
                await DatabaseService.removePost(post.id);

                //toast post removed
                this.$emit('show-toast', 'Post removed successfully');
            } catch (error) {
                this.$emit('show-toast', 'Post NOT removed successfully');
            }
        },

        async syncPosts() {
            this.showSyncModal = true;
        },

        async getSync() {
            let syncDone = await DatabaseService.receivePosts(this.SyncPIN, state.currentUser.id);
            if (syncDone) {
                this.showSyncModal = false;
                // emit user-selected event to reload posts
                this.$emit('user-selected');
            }
            this.posts = posts;
            this.showSyncModal = false;
        },

        async sendSync() {
            let syncDone = await DatabaseService.sendPosts(this.SyncPIN, state.currentUser.id);
            if (!syncDone) {
                this.$emit('show-toast', 'Posts NOT sent successfully', 3000);
            }
            else
                this.$emit('show-toast', 'Posts sent successfully', 3000);
            this.showSyncModal = false;
        },

        async createNewList() {
            if (!this.newListName) return;
            await DatabaseService.createList(state.currentUser.id, this.newListName);
            this.lists = await DatabaseService.getLists(state.currentUser.id);
            this.newListName = '';
        },
        async saveToList(listId) {
            await DatabaseService.savePostToList(
                this.currentPost.id,
                listId,
                state.currentUser.id
            );
            this.showListModal = false;
        },
        showActionSheet() {
            this.SyncPIN = '';
            this.showActionSheetModal = true;
        },
        triggerFileInput() {
            this.$refs.fileInput.click();
        },
        async exportPosts() {
            // const posts = await DatabaseService.getPosts(state.currentUser.id);
            // const json = JSON.stringify(posts);
            // const blob = new Blob([json], { type: 'application/json' });
            // const url = URL.createObjectURL(blob);
            // const a = document.createElement('a');
            // a.href = url;
            // a.download = `${stringTSFS()}.json`;
            // a.click();
            // URL.revokeObjectURL(url);
            // this.$emit('show-toast', 'Posts exported successfully', 3000);

        },
        async importPosts(event) {
            // const file = event.target.files[0];
            // if (file) {
            //     const reader = new FileReader();
            //     reader.onload = async (e) => {
            //         let posts = [];
            //         try {
            //             posts = JSON.parse(e.target.result);
            //         } catch (error) {
            //             this.$emit('show-toast', 'Posts NOT imported successfully', 3000);

            //             // alert('Posts not imported ...');
            //             console.error(error);
            //             return;
            //         }

            //         for (const post of posts) {
            //             // Reset the userID
            //             post.userId = state.currentUser.id;
            //             await DatabaseService.addPost(post);
            //         }
            //         // emit user-selected event to reload posts
            //         this.$emit('user-selected');
            //         this.$emit('show-toast', 'Posts imported successfully');
            //     };
            //     reader.readAsText(file);
            // }
        }

    }
});