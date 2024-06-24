// src/directives/dynamicHtml.js
import { h, render, nextTick } from 'vue';

export default {
  mounted(el, binding) {

    el.innerHTML = binding.value;
    const container = document.createElement('div');
    container.innerHTML = binding.value;
    Array.from(container.childNodes).forEach(node => {
      el.appendChild(node);
    });

    nextTick(() => {
      Array.from(el.childNodes).forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const componentName = node.tagName.toLowerCase();
          if (el.__vueParentComponent.appContext.components[componentName]) {
            const wrapper = h(el.__vueParentComponent.appContext.components[componentName]);
            render(wrapper, node);
          }
        }
      });
    });
  },
  updated(el, binding) {
    if (binding.value !== binding.oldValue) {
      el.innerHTML = binding.value;
      const container = document.createElement('div');
      container.innerHTML = binding.value;
      Array.from(container.childNodes).forEach(node => {
        el.appendChild(node);
      });

      nextTick(() => {
        Array.from(el.childNodes).forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const componentName = node.tagName.toLowerCase();
            if (el.__vueParentComponent.appContext.components[componentName]) {
              const wrapper = h(el.__vueParentComponent.appContext.components[componentName]);
              render(wrapper, node);
            }
          }
        });
      });
    }
  },
};
