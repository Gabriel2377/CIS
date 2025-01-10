// Register longpress directive globally
Vue.directive('longpress', {
    bind(el, binding) {
      let pressTimer = null;

      const start = (e) => {
        if (e.type === 'click' && e.button !== 0) return;

        pressTimer = setTimeout(() => {
          binding.value(e); // Execute the callback
        }, 1000); // Adjust duration for long press
      };

      const cancel = () => {
        if (pressTimer !== null) {
          clearTimeout(pressTimer);
          pressTimer = null;
        }
      };

      el.addEventListener('mousedown', start);
      el.addEventListener('touchstart', start);
      el.addEventListener('mouseup', cancel);
      el.addEventListener('mouseleave', cancel);
      el.addEventListener('touchend', cancel);
    },
  });