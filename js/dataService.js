class DataService {

    static get currentPostViewType(){
        return state.currentPostViewType;
    }

    static async setPostType(post) {

        let postData = {
            userId: post.userId,
            type: post.type,
        };

        const url = `https://n2n.openpath.foundation/webhook/5a725277-99bf-4d2b-827b-4ccf163a48bb/posts/${post.id}/setType`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': localStorage.getItem('token'),
                'Content-Type': 'application/json',
            },

            body: JSON.stringify(postData),  // body contains JSON data
        });

        if (!response.ok) {
            throw new Error('Failed to set post type');
        }
    }

    static async updatePost(post) {

        let postData = post;
        postData.content = strToBase64(postData.content);

        const url = `https://n2n.openpath.foundation/webhook/5a725277-99bf-4d2b-827b-4ccf163a48bb/posts/${post.id}/update`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': localStorage.getItem('token'),
                'Content-Type': 'application/json',
            },

            body: JSON.stringify(postData),  // body contains JSON data
        });

        if (!response.ok) {
            throw new Error('Failed to set post type');
        }
    }

    // Method for making GET request
    static async getPosts(postId = Number.MAX_SAFE_INTEGER, loadExact = false) {
        state.postsIndex += POSTS_AHEAD * Math.sign(postId);
        const url = `https://n2n.openpath.foundation/webhook/f50df3ab-cdd3-44c4-80b1-a262925d221b/posts/${postId}`;

        let headers = {
            'Authorization': localStorage.getItem('token'),
            'load': 'exact',
            'filterPostType': DataService.currentPostViewType
        };

        if (this.currentPostViewType===undefined) {
            delete headers.filterPostType
        }

        if (!loadExact) {
            delete headers.load;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers,
        });

        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }

        let postData = await response.json();  // return the response JSON data
        postData.map(post => {
            try {
                post.content = base64ToStr(post.content)
            } catch (error) {
                console.error('Error:', error);
            }
        });
        return postData;
    }

    // Method for making POST request
    static async createPost(postData) {

        if (postData.id) {
            this.updatePost(postData);
            return;
        }

        postData.content = strToBase64(postData.content);

        const url = `https://n2n.openpath.foundation/webhook/5a725277-99bf-4d2b-827b-4ccf163a48bb/posts/0`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': localStorage.getItem('token'),
                'Content-Type': 'application/json',
            },

            body: JSON.stringify(postData),  // body contains JSON data
        });

        if (!response.ok) {
            throw new Error('Failed to create post');
        }

        // return await response.json();  // return the response JSON data
    }

    // Method for making DELETE request
    static async removePost(postId) {
        const url = `https://n2n.openpath.foundation/webhook/5a725277-99bf-4d2b-827b-4ccf163a48bb/posts/${postId}/remove`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': localStorage.getItem('token'),
            },

            // body: JSON.stringify(postData),  // body contains JSON data
        });

        if (!response.ok) {
            throw new Error('Failed to remove post');
        }

        // return await response.json();  // return the response JSON data
    }
    
}

