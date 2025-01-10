Vue.component('color-picker', {
    template: `
        <div class="modal" @click.self="$emit('close')">
            <div class="modal-content">
                <h3>Select Color</h3>
                <div class="color-grid">
                    <div v-for="color in colors"
                         :key="color"
                         class="color-option"
                         :style="{ background: color }"
                         @click="selectColor(color)">
                    </div>
                </div>
                <input type="range" 
                       v-model="opacity" 
                       min="0" 
                       max="100"
                       style="width: 100%">
                <button @click="$emit('close')">Close</button>
            </div>
        </div>
    `,
    data() {
        return {
            colors: constants.COLORS,
            opacity: 100
        };
    },
    methods: {
        selectColor(color) {
            const rgba = this.hexToRgba(color, this.opacity / 100);
            this.$emit('color-selected', rgba);
        },
        hexToRgba(hex, alpha) {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }
    }
});