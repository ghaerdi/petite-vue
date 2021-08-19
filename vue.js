class Vue {
  constructor(config) {
    this.el = document.querySelector(config.el);
		this.data = config.data;

		const render = renderVue(this);

		render();
		defineReactive(this.data, render);
  }
}

function renderVue(Vue) {
	const originalInnerHTML = Vue.el.innerHTML;

	return () => {
		const { data } = Vue;

		Vue.el.innerHTML = originalInnerHTML.replace(
			/\{\{((?:.|\r?\n)+?)\}\}/g,
			(_, val) => data[val.trim()]
		);
	}
}

function defineReactive(obj, cb) {
	for (const key in obj) {
		let value = obj[key];
		Object.defineProperty(obj, key, {
			get() {
				return value;
			},
			set(newValue) {
				if (value === newValue) return;
				value = newValue;
				cb()
			}
		})
	}
}