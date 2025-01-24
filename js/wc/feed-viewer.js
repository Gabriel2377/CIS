class FeedViewer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.currentPost = null;
    this.touchStartX = 0;
    this.touchEndX = 0;
    this.swipeSensitivity = 50; // pixels
    this.activePostIndex = 0;
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          user-select: none !important;
          display: block;
          width: 100vw; 
        }

        .ql-align-center {
          text-align: center;
        }
        
        .post {
            width: 100%;
            background-size: cover;
            background-position: center;
            color: #ffffffdb;
            text-shadow: 5px 3px 3px rgb(0 0 0 / 93%);
            transition: opacity 0.2s ease;
        }
            
        .post-content {
            display: flex;
            position: relative;
            scrollbar-width: none;
            height: 100vh;
            overflow-y: auto;
            padding: 20px;
            /* background-color: rgba(0, 0, 0, 0.50); */
            color: #ffffffc4;
            border-radius: 0px;
            flex-direction: column;
            justify-content: center;
        }
        .panel-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 10;
        }
        
      </style>
      <div class="panel-container">
        <slot name="panel"></slot>
      </div>
      <div id="post-container">
        <div class="post" id="post1"></div>
        <div class="post" id="post2" style="opacity: 0;"></div>
      </div>
    `;
  }

  setupEventListeners() {
    this.addEventListener('touchstart', this.handleTouchStart.bind(this));
    this.addEventListener('touchend', this.handleTouchEnd.bind(this));
    this.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.addEventListener('mouseup', this.handleMouseUp.bind(this));

    const panel = this.shadowRoot.querySelector('slot[name="panel"]');
    if (panel) {
      this.setupPanelEventListeners(panel);
    }
  }

  setupPanelEventListeners(panel) {
    panel.addEventListener('click', (event) => {

      // Check if the click event was triggered by a button element or its child element
      let target = event.target.closest('button');
      if (target) {
        const buttonId = target.id;
        this.dispatchEvent(new CustomEvent('postAction', {
          detail: {
            action: buttonId,
            postId: this.currentPost.id,
            postIndex: this.currentIndex
          }
        }));
      }
    });
  }

  handleTouchStart(event) {
    this.touchStartX = event.touches[0].clientX;
  }

  handleTouchEnd(event) {
    this.touchEndX = event.changedTouches[0].clientX;
    this.handleSwipe();
  }

  handleMouseDown(event) {
    this.touchStartX = event.clientX;
  }

  handleMouseUp(event) {
    this.touchEndX = event.clientX;
    this.handleSwipe();
  }

  handleSwipe() {
    const swipeDistance = this.touchEndX - this.touchStartX;
    if (Math.abs(swipeDistance) > this.swipeSensitivity) {
      const direction = swipeDistance > 0 ? 'right' : 'left';
      this.loadData(direction);
    }
  }

  loadData(direction) {
    const details = {
      direction,
      currentPostId: this.currentPost ? this.currentPost.id : null
    };
    this.dispatchEvent(new CustomEvent('loadData', { detail: details }));
  }

  displayPost(post) {
    if (!post) {
      this.emitError('No post data available');
      return;
    }

    const postElements = [
      this.shadowRoot.getElementById('post1'),
      this.shadowRoot.getElementById('post2')
    ];

    const oldIndex = this.activePostIndex;
    this.activePostIndex = 1 - this.activePostIndex;

    const newPostElement = postElements[this.activePostIndex];
    const oldPostElement = postElements[oldIndex];

    newPostElement.style.backgroundImage = `url(${post.backgroundUrl})`;
    newPostElement.innerHTML = `
      <div class="post-content" style="background-color: rgba(0, 0, 0, ${post.overlayTransparency});">
        ${post.content}
      </div>
    `;


    newPostElement.style.display = 'block';
    newPostElement.style.opacity = '1';
    oldPostElement.style.opacity = '0';
    oldPostElement.style.display = 'none';

    this.currentPost = post;
    this.currentIndex = (this.currentIndex + 1) % 2;

  }

  emitError(errorMessage) {
    this.dispatchEvent(new CustomEvent('error', { detail: errorMessage }));
  }
}

customElements.define('feed-viewer', FeedViewer);
