window.html = (strings, ...values) => strings.reduce((result, str, i) => result + str + (values[i] || ''), '');


// Function to convert HSL to Hex
function hslToHex(h, s, l) {
    s /= 100; l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = l - c / 2;
    let [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
    return `#${(1 << 24 | ((Math.round((r + m) * 255)) << 16) | ((Math.round((g + m) * 255)) << 8) | Math.round((b + m) * 255)).toString(16).slice(1).toUpperCase()}`;
}

  
  // create a function to generate color gradients
  const generateColorGradients = () => Array.from({ length: 360 }, (_, index) => {
    const hue = index; 
    const saturation = 39; // Fixed saturation value
    const lightness = 68;  // Fixed lightness value
  
    // Convert HSL to Hex
    return hslToHex(hue, saturation, lightness);
  });

  function stringTSFS() {
    const now = new Date();
    const pad = (num) => String(num).padStart(2, '0');

    const year = String(now.getFullYear()).slice(-2);
    const month = pad(now.getMonth() + 1);
    const day = pad(now.getDate());
    const hours = pad(now.getHours());
    const minutes = pad(now.getMinutes());

    return `${year}.${month}.${day}_${hours}.${minutes}`;
}
  
  // Function to decode Base64 to UTF-8 string
function base64ToStr(base64String) {
  // Decode Base64 string to raw binary string
  const decodedData = atob(base64String);

  // Convert the decoded binary string to a UTF-8 string
  const utf8String = new TextDecoder().decode(new TextEncoder().encode(decodedData));

  return utf8String;
}

// Function to encode UTF-8 string to Base64
function strToBase64(utf8String) {
  // Convert the UTF-8 string to binary data
  const binaryData = new TextEncoder().encode(utf8String);

  // Encode the binary data to Base64
  const base64String = btoa(String.fromCharCode(...binaryData));

  return base64String;
}


// Global error handler
window.onerror = function(message, source, lineno, colno, error) {
  alert(`Error: ${message}\nSource: ${source}\nLine: ${lineno}\nColumn: ${colno}\nError Object: ${error}`);
  return false; // Prevent the default browser error handling
};
