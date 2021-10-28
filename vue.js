class Vue {
  constructor({ el, data, beforeCreate, created, mounted, methods }) {
    // Before Create
    beforeCreate?.bind(this)();

    this.$el = document.querySelector(el);
    this.$data = data;

    walkDataProps(this);
    walkMethods(this, methods);

    // Create
    created?.bind(this)();

    const render = renderVue(this);
    walkDataProps(this, render);
    render();

    // Mount
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
 * read the Vue.$el and replace the HTML to the vue's data.
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
		// extract name attr and method of v-on:[event]=[method] or @[event]=[method]
    const { name, value: method } = el.attributes[1];
		// get event from v-on:[event] or @[event]
    const event = /@/.test(name) ? name.slice(1) : name.split(":")[1];

    el.addEventListener(event, vue[method].bind(vue.$data));

    clearElement(el, ["vue-event",`v-on:${event}`, `@${event}`])
  });
}

function clearElement(el, attributes) {
  attributes.forEach(attr => el.removeAttribute(attr));
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
    defineReactive(vue, key);
    defineReactive(vue, key, cb);
  }
}

/**
 * change set behavior and define props for Vue and Vue.data from Vue.data
 * @param {Vue} obj
 * @param {string} key
 * @param {Function} cb
 * @param {boolean} redefineData
 */
function defineReactive(obj, key, cb) {
  let value = obj.$data[key];

  Object.defineProperty(cb ? obj.$data : obj, key, {
    configurable: true,
    get() {
      return value;
    },
    set(newValue) {
      if (value === newValue) return;
      value = newValue;

      if (cb) {
        obj[key] = value;
        cb();
      } else {
        obj.$data[key] = value;
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
