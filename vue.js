class Vue {
  constructor(config) {
    this.$el = document.querySelector(config.el);
    this.$data = config.data;

    if (config.mounted) {
      this.$mount = config.mounted;
    }

    config.created?.();

    walkMethods(this, config.methods);

    const render = renderVue(this);
    render();

    walkDataProps(this, render);

    this.$mount?.();
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
  const initialTemplate = addAttributes(vue.$el.cloneNode(true));

  return () => {
    const { $data } = vue;
    const template = initialTemplate.cloneNode(true);
    const states = template.querySelectorAll("[state]");

    states.forEach((el) => {
      const { innerHTML } = el;
      el.innerHTML = innerHTML.replace(
        regex.mostach,
        (_, val) => $data[val.trim()]
      );
    });

    vue.$el.innerHTML = "";
    for (const child of template.children) {
      vue.$el.appendChild(child.cloneNode(true));
    }
    addEvents(vue);
  };
}

function addEvents(vue) {
  vue.$el.querySelectorAll("[vue-event]").forEach(el => {
    const {name, value: method} = el.attributes[1];
    const event = /@/.test(name) ? name.slice(1) : name.split(":")[1];
    el.addEventListener(event, vue[method].bind(vue.$data));
  })
}

function addAttributes(el) {
  const { vueOn, mostach } = regex;

  const template = el;

  template.innerHTML = el.innerHTML.replace(
    new RegExp(`${vueOn.source}|(>${mostach.source})`, "g"),
    (match) => {
      if (mostach.test(match)) {
        return ` state ${match}`;
      }
      return `vue-event ${match}`;
    }
  );

  return template;
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
