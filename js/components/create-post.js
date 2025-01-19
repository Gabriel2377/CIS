Vue.component('create-post', {
    template: html`
        <div class="editor-container">
            <div class="editor-content" :style="{ backgroundImage: backgroundUrl ? 'url(' + backgroundUrl + ')' : 'none' }">
                <div class="post-overlay" :style="{ backgroundColor: 'rgba(0, 0, 0, ' + overlayTransparency + ')' }">
                    <!-- disable spellcheck -->
                    <div id="editor" spellcheck="false">
                    Tot ce voiti sa va faca voua oamenii facetile si voi la fel caci in aceasta este cuprinsa Legea si Prorocii
                    </div>
                </div>
            </div>
            
            <div class="editor-toolbar">
                <div class="fab-menu">
                    <button class="fab" @click="showFormatting = !showFormatting">
                        <i class="fas fa-font"></i>
                    </button>
                    <div v-if="showFormatting" class="format-options">
                        <button @click="format('bold')"><i class="fas fa-bold"></i></button>
                        <button @click="format('italic')"><i class="fas fa-italic"></i></button>
                        <button @click="format('underline')"><i class="fas fa-underline"></i></button>
                    </div>
                </div>
                
                <div class="fab-menu">
                    <button class="fab" @click="showAlignment = !showAlignment">
                        <i class="fas fa-align-left"></i>
                    </button>
                    <div v-if="showAlignment" class="format-options">
                        <button @click="align('left')"><i class="fas fa-align-left"></i></button>
                        <button @click="align('center')"><i class="fas fa-align-center"></i></button>
                        <button @click="align('right')"><i class="fas fa-align-right"></i></button>
                        <button @click="align('justify')"><i class="fas fa-align-justify"></i></button>
                    </div>
                </div>

                <div class="fab-menu">
                    <button class="fab" @click="showMediaOptions = !showMediaOptions">
                        <i class="fas fa-image"></i>
                    </button>
                    <div v-if="showMediaOptions" class="format-options">
                        <button @click="showBackgroundModal = true"><i class="fas fa-image"></i></button>
                        <button @click="showColorPicker = true"><i class="fas fa-palette"></i></button>
                        <button @click="showFontPicker = true"><i class="fas fa-text-height"></i></button>
                    </div>
                </div>

                <div class="fab-menu">
                    <button class="fab" @click="showFontSizeOptions = !showFontSizeOptions">
                        <i class="fas fa-text-height"></i>
                    </button>
                    <div v-if="showFontSizeOptions" class="format-options">
                        <button @click="changeFontSize('increase')"><i class="fas fa-plus"></i></button>
                        <button @click="changeFontSize('decrease')"><i class="fas fa-minus"></i></button>
                        <button @click="changeLineSize('increase')"><i class="fas fa-plus"></i>&nbsp;<i class="fas fa-arrows-alt-v"></i></button>
                        <button @click="changeLineSize('decrease')"><i class="fas fa-minus"></i>&nbsp;<i class="fas fa-arrows-alt-v"></i></button>
                        <button @click="changeLetterSpacing('increase')"><i class="fas fa-plus"></i>&nbsp;<i class="fas fa-arrows-alt-h"></i></button>
                        <button @click="changeLetterSpacing('decrease')"><i class="fas fa-minus"></i>&nbsp;<i class="fas fa-arrows-alt-h"></i></button>
                    </div>
                </div>
                
                <button class="fab" 
                    @click="savePost">
                    <i class="fas fa-check"></i>
                </button>
            </div>

            <!-- Background URL Modal -->
            <div v-if="showBackgroundModal" class="modal" @click.self="showBackgroundModal = false">
                <div class="modal-content">
                    <h3>Set Background Image</h3>
                    <input v-model="backgroundUrl" 
                           type="text" 
                           placeholder="Enter image URL">
                    <input id="transparency" type="range" v-model="overlayTransparency" min="0" max="1" step="0.01">
                    <button @click="setBackground">Set Background</button>
                    <button @click="showBackgroundModal = false">Cancel</button>
                </div>
            </div>

            <!-- Color Picker Modal -->
            <color-picker v-if="showColorPicker"
                         @close="showColorPicker = false"
                         @color-selected="setColor">
            </color-picker>

            <!-- Font Picker Modal -->
            <font-picker v-if="showFontPicker"
                        @close="showFontPicker = false"
                        @font-selected="setFont">
            </font-picker>

            
        </div>
    `,

    data() {
        return {
            editor: null,
            backgroundUrl: '',
            showBackgroundModal: false,
            showColorPicker: false,
            showFontPicker: false,
            showFormatting: false,
            showAlignment: false,
            showMediaOptions: false,
            showFontSizeOptions: false,
            overlayTransparency: 0.5,
            existingPost: { content: '' },
            existingPostId: null
        };
    },

    mounted() {

        // load existingPostId post

        this.existingPostId = state.currentPost.id;
        if (this.existingPostId) {
            this.existingPost = DatabaseService.getPosts(this.existingPostId, true).then(posts => {
                this.existingPost = posts[0]
                this.backgroundUrl = this.existingPost.backgroundUrl;
                this.overlayTransparency = this.existingPost.overlayTransparency;
                state.editor.root.innerHTML = this.existingPost.content;
            });
        }

        try {
            // Define a custom LetterSpacing format
            let Inline = Quill.import('blots/inline');
            class LetterSpacing extends Inline {
                static create(value) {
                    let node = super.create();
                    node.style.letterSpacing = value;
                    return node;
                }

                static formats(node) {
                    return node.style.letterSpacing || 'normal';
                }
            }

            LetterSpacing.blotName = 'letterSpacing';
            LetterSpacing.tagName = 'span';
            LetterSpacing.className = 'letter-spacing';
            Quill.register(LetterSpacing);

            // Define a custom LineHeight format
            let Block = Quill.import('blots/block');
            class LineHeight extends Block {
                static create(value) {
                    let node = super.create();
                    node.style.lineHeight = value;
                    return node;
                }

                static formats(node) {
                    return node.style.lineHeight || 'normal';
                }
            }

            LineHeight.blotName = 'lineHeight';
            LineHeight.tagName = 'div';
            Quill.register(LineHeight);
        } catch (error) {

        }


        // add an array of font values
        const fontFamilyArr = constants.FONTS;
        let fonts = Quill.import("attributors/style/font");
        fonts.whitelist = fontFamilyArr;
        Quill.register(fonts, true);

        // add an array of size values
        const fontSizeArr = constants.FONTSIZES;
        var Size = Quill.import('attributors/style/size');
        Size.whitelist = fontSizeArr;
        Quill.register(Size, true);

        // Initialize Quill with specific modules and formats
        state.editor = new Quill('#editor', {
            theme: 'snow',
            modules: {
                toolbar: false
            },
            formats: ['bold', 'italic', 'underline', 'align', 'color', 'font', 'size', 'letterSpacing', 'lineHeight']
        });

        state.editor.on('selection-change', (range) => {
            if (range) {
                // Save the selection when the user finishes selecting
                state.editorCurrentSelection = range;
            }
        });

        // Set default styles
        state.editor.root.style.color = 'white';
        state.editor.root.style.fontSize = FONTSIZES[0];
        // // Set line heights
        // state.editor.root.style.lineHeight = '1.5';

        // Add click handler to close format menus when clicking outside
        document.addEventListener('click', this.handleClickOutside);
    },

    beforeDestroy() {
        document.removeEventListener('click', this.handleClickOutside);
    },

    methods: {

        closeColorPicker() {
            //hide color picker
            this.showColorPicker = false;
            //restore selection in the editor
            const selection = state.editorCurrentSelection;
            if (selection) {
                state.editor.setSelection(selection);
            }
        },

        closeFontPicker() {
            //hide font picker
            this.showFontPicker = false;
            //restore selection in the editor
            const selection = state.editorCurrentSelection;
            if (selection) {
                state.editor.setSelection(selection);
            }
        },

        handleClickOutside(event) {
            if (!event.target.closest('.fab-menu')) {
                this.showFormatting = false;
                this.showAlignment = false;
                this.showMediaOptions = false;
                this.showFontSizeOptions = false;
            }
        },

        format(command) {
            const selection = state.editorCurrentSelection;
            if (selection) {
                const currentFormat = state.editor.getFormat(selection);
                state.editor.format(command, !currentFormat[command]);
            }
        },

        align(alignment) {
            const selection = state.editorCurrentSelection;
            if (selection) {
                //set alignment to null for 'left' value
                if (alignment === 'left') {
                    alignment = null;
                }

                state.editor.format('align', alignment);
            }
        },

        setBackground() {
            this.showBackgroundModal = false;
        },

        setColor(color) {
            const selection = state.editorCurrentSelection;
            if (selection) {
                state.editor.format('color', color);
            }
        },

        setFont(fontName) {
            const selection = state.editorCurrentSelection;
            if (selection) {
                state.editor.format('font', fontName);
            }
        },

        changeLineSize(action) {
            const selection = state.editorCurrentSelection;
            if (selection) {
                const currentFormat = state.editor.getFormat(selection);
                let currentLineHeight = currentFormat.lineHeight * 1 || 1;
                const lineHeights = constants.LINE_HEIGHTS;
                const sizeIndex = lineHeights.indexOf(currentLineHeight);
                if (action === 'increase' && sizeIndex < lineHeights.length - 1) {
                    state.editor.format('lineHeight', lineHeights[sizeIndex + 1]);
                } else if (action === 'decrease' && sizeIndex > 0) {
                    state.editor.format('lineHeight', lineHeights[sizeIndex - 1]);
                }
            }
        },

        changeLetterSpacing(action) {
            const selection = state.editorCurrentSelection;
            if (selection) {
                const currentFormat = state.editor.getFormat(selection);
                let currentLetterSpacing = currentFormat.letterSpacing || '2px';
                // create an array of letter spacing values with step of 2px
                const letterSpacings = constants.LETTER_SPACINGS;
                const sizeIndex = letterSpacings.indexOf(currentLetterSpacing);
                if (action === 'increase' && sizeIndex < letterSpacings.length - 1) {
                    state.editor.format('letterSpacing', letterSpacings[sizeIndex + 1]);
                } else if (action === 'decrease' && sizeIndex > 0) {
                    state.editor.format('letterSpacing', letterSpacings[sizeIndex - 1]);
                }
            }
        },

        changeFontSize(action) {
            const selection = state.editorCurrentSelection;
            if (selection) {
                const currentFormat = state.editor.getFormat(selection);
                let currentSize = currentFormat.size || constants.FONTSIZES[0];
                const sizeIndex = constants.FONTSIZES.indexOf(currentSize);
                if (action === 'increase' && sizeIndex < constants.FONTSIZES.length - 1) {
                    state.editor.format('size', constants.FONTSIZES[sizeIndex + 1]);
                } else if (action === 'decrease' && sizeIndex > 0) {
                    state.editor.format('size', constants.FONTSIZES[sizeIndex - 1]);
                }
            }
        },

        async savePost() {
            const content = state.editor.root.innerHTML;
            // await DatabaseService.addPost({
            //     content,
            //     backgroundUrl: this.backgroundUrl,
            //     userId: state.currentUser.id,
            //     createdAt: Date.now()
            // });

            await DataService.createPost({
                id: this.existingPostId,
                type: state.currentPost.type,
                content,
                backgroundUrl: this.backgroundUrl,
                userId: state.currentUser.id,
                createdAt: Date.now(),
                overlayTransparency: this.overlayTransparency
            });

            // notify post creation
            this.$emit('create-post');

            // switch to feed view
            this.$emit('switch-view', 'feed-view');
        }
    }
});