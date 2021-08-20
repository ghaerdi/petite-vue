class Vue {
  constructor(config) {
    this.el = document.querySelector(config.el);
		this.$data = config.data;

		if (config.mounted) {
			this.$mount = config.mounted;
		}

		config.created?.();

		const render = renderVue(this);
		render();

		walkDataProps(this, render);
		walkMethods(this, config.methods);
		this.$mount?.();
  }
}

//#region rendering

/**
 * read the Vue.el and replace the HTML to the vue's data.
 * @param {Vue} vue
 * @returns {() => void}
 */
function renderVue(vue) {
	const originalInnerHTML = vue.el.innerHTML;

	return () => {
		const { $data } = vue;

		vue.el.innerHTML = originalInnerHTML.replace(
			/\{\{((?:.|\r?\n)+?)\}\}/g,
			(_, val) => $data[val.trim()]
		);
	}
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
			}
			else {
				obj[key] = value;
			}

			if (!redefineData) {
				cb();
			}
		}
	})
}

//#endregion

//#region methods

function walkMethods(vue, methods) {
	for (const key in methods) {
		vue[key] = methods[key];
	}
}

//#endregion