class Vue {
  constructor({ el, data, beforeCreate, created, mounted, methods }) {
    beforeCreate?.bind(this)();

    this.$el = document.querySelector(el);
    this.$data = data;

    walkDataProps(this);
    walkMethods(this, methods);

    created?.bind(this)();

    const render = renderVue(this);
    walkDataProps(this, render);
    render();

    if (mounted) {
      this.$mount = mounted;
      this.$mount();
    }
  }
}

//#region regex

const regex = {
  vueOn: /(@|v-on:)\w+="([0-z.?]+)\(?\)?"/,
  eventAtt: /vue-event(=""?)/,
  mostach: /\{\{((?:.|\r?\n)+?)\}\}/,
};

//#endregion

//#region rendering

/**
 * read the Vue.el and replace the HTML to the vue's data.
 * @param {Vue} vue
 * @returns {() => void}
 */
function renderVue(vue) {
  const originalTemplate = addAttributes(vue.$el.cloneNode(true));

  return () => {
    const { $data } = vue;

    vue.$el.innerHTML = originalTemplate.innerHTML.replace(
      new RegExp(regex.mostach, "g"),
      (_, val) => $data[val.trim()]
    );

    addEvents(vue);
  };
}

function addEvents(vue) {
  vue.$el.querySelectorAll("[vue-event]").forEach((el) => {
    const { name, value: method } = el.attributes[1];
    const event = /@/.test(name) ? name.slice(1) : name.split(":")[1];
    el.addEventListener(event, vue[method].bind(vue.$data));

    // TODO: Move removeAttr to function and make it better
    el.removeAttribute("vue-event");
    el.removeAttribute(`v-on:${event}`);
    el.removeAttribute(`@${event}`);
  });
}

function addAttributes(el) {
  el.innerHTML = el.innerHTML.replace(
    new RegExp(regex.vueOn, "g"),
    (match) => `vue-event ${match}`
  );

  return el;
}

//#endregion

//#region state

/**
 * read all props of a object and call defineReactive.
 * @param {Vue} vue
 * @param {Function} cb
 */
function walkDataProps(vue, cb) {
  for (const key in vue.$data) {
    defineReactive(vue, key, cb);
    defineReactive(vue, key, cb, true);
  }
}

/**
 * change set behavior and define props for Vue and Vue.data from Vue.data
 * @param {Vue} obj
 * @param {string} key
 * @param {Function} cb
 * @param {boolean} redefineData
 */
function defineReactive(obj, key, cb, redefineData) {
  let value = obj.$data[key];

  Object.defineProperty(redefineData ? obj.$data : obj, key, {
    configurable: true,
    get() {
      return value;
    },
    set(newValue) {
      if (value === newValue) return;
      value = newValue;

      if (!redefineData) {
        obj.$data[key] = value;
      } else {
        obj[key] = value;
      }

      if (!redefineData) {
        cb();
      }
    },
  });
}

//#endregion

//#region methods

function walkMethods(vue, methods) {
  for (const key in methods) {
    vue[key] = methods[key];
  }
}

//#endregion
