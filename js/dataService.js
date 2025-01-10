class DataService {
    // Method for making GET request
    static async getPosts(postId = Number.MAX_SAFE_INTEGER) {
        state.postsIndex += POSTS_AHEAD * Math.sign(postId);
        const url = `https://n2n.openpath.foundation/webhook/f50df3ab-cdd3-44c4-80b1-a262925d221b/posts/${postId}`;

        const response = await fetch(url, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }

        let postData = await response.json();  // return the response JSON data
        postData.map(post => post.content = base64ToStr(post.content));
        return postData;
    }

    // Method for making POST request
    static async createPost(postData) {

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
            throw new Error('Failed to create post');
        }

        // return await response.json();  // return the response JSON data
    }
    
}

