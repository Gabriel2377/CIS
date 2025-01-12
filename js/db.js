
const gun = Gun();

const db = new Dexie('socialApp');

db.version(1).stores({
    users: '++id, name, createdAt',
    posts: '++id, userId, content, backgroundUrl, createdAt, type',
    lists: '++id, userId, name',
    savedPosts: '++id, postId, listId, userId'
});

const DatabaseService = {
    async initUser(name) {
        const userId = await db.users.add({
            name,
            createdAt: Date.now()
        });
        return db.users.get(userId);
    },

    // getUsers
    async getUsers() {
        return db.users.toArray();
    },

    async getCurrentUser() {
        // const user = await db.users.toArray();
        // return user[0] || null;
        const user = sessionStorage.getItem('currentUser');
        if (user) {
            this.currentUser = JSON.parse(user);
            return this.currentUser;
        }
        return null;
    },

    async addPost(post) {
        return db.posts.add(post);
    },

    async removePost(postId) {
        await DataService.removePost(postId);
    },

    async setPostType(post) {
        await DataService.setPostType(post);
    },

    async getPosts(postId = Number.MAX_SAFE_INTEGER) {
        let posts = await DataService.getPosts(postId || Number.MAX_SAFE_INTEGER);
        // let posts = await db.posts.where('userId').equals(userId)
        //     .sortBy('createdAt');
        // posts = posts.map(post => (post.content += ' ' + post.id, post));
        return posts;
    },

    async createList(userId, name) {
        return db.lists.add({ userId, name });
    },

    async getLists(userId) {
        return db.lists.where('userId').equals(userId).toArray();
    },

    async savePostToList(postId, listId, userId) {
        return db.savedPosts.add({ postId, listId, userId });
    },

    putPostAsync(post, gunChannel) {
        return new Promise((resolve, reject) => {
            gunChannel.get(post.id).put(post, (ack) => {
                if (ack.err) {
                    reject(ack.err); // Reject if there's an error
                } else {
                    resolve(ack); // Resolve when the put operation is done
                }
            });
        });
    },

    // Send posts to the GUN channel
    async sendPosts(sharedPin, userId) {
        // Get all posts for userId
        const posts = await db.posts.where('userId').equals(userId).toArray();
        const gunChannel = gun.get(`posts-transfer-${sharedPin}`);

        try {
            for (const post of posts) {
                await this.putPostAsync(post,gunChannel); // Wait for each async operation to finish
                console.log(`Post synced: ${post.id}`);
            }
    
            // Remove all listeners
            await this.putPostAsync({ id: Date.now(), eod: true }, gunChannel);
            gunChannel.off();
            console.log("Posts sent!");
            return true;
        } catch (error) {
            console.error("Error sending posts: ", error);
            return false;
        }
    },

    // Receive posts and store them in Dexie.js
    receivePosts(sharedPin, userId) {

        // use a promise to wait for the sync to complete
        return new Promise((resolve, reject) => {
            const gunChannel = gun.get(`posts-transfer-${sharedPin}`);
            gunChannel.map().on(async (data, key) => {
                //handle eod
                if (data && data.eod) {
                    gunChannel.off();
                    console.log("Sync completed!");
                    resolve(true);
                }
                else if (data && key) {
                    const existing = await db.posts.get(parseInt(key));
                    if (!existing || existing.createdAt < data.createdAt) {
                        data.userId = userId;
                        await db.posts.put(data);
                        console.log(`Post synced: ${key}`);
                    }
                }
            });
            console.log("Sync started!");
        });

    }




};