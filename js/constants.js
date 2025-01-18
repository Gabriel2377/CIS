

const FONTS = [
    'Arial',
    'Helvetica',
    'Times New Roman',
    'Georgia',
    'Courier New',
    'Verdana',
    'Impact',
    'Comic Sans MS',
    'Trebuchet MS',
    'Arial Black',
    'Palatino',
    'Garamond',
    'Bookman',
    'Tahoma',
    'Lucida Console'
];


const COLORS = generateColorGradients();

const FONTSIZES = [
    '16px', '18px',
    '20px', '22px', '24px', '26px', '28px', '30px', '32px', 
    '34px', '36px', '38px', '40px', '42px', '44px', '46px'
];

const LINE_HEIGHTS = Array.from({ length: 8 }, (_, i) =>1 + i * 0.25);

const LETTER_SPACINGS = Array.from({ length: 10 }, (_, i) => (i+1) * 2 + 'px');

const constants = {
    FONTS,
    FONTSIZES,
    COLORS,
    LINE_HEIGHTS,
    LETTER_SPACINGS
}

// needs to be set also on the server to work
const POSTS_AHEAD = 3;