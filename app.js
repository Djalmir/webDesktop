import Home from './views/home.js'
import Desktop from './views/desktop.js'

import ErrorMsgs from './components/errorMsgs.js'
import zionLoading from './components/loading.js'
import ContextMenu from './components/contextMenu.js'
import zDialog from './components/zDialog.js'

const routes = {
	'#/': Home,
	'#/desktop': Desktop
}

const components = [
	//add here the component id you used on html tags (see index.html)
	appLoading,
	contextMenu // VS code is trying to say that the correct would start with uppercase (ContextMenu). But it isn't. Because the component id starts with lowercase 😉
]

let globalStyle

fetch('./app.css')
	.then((res) => {return res.text()})
	.then((res) => {
		globalStyle = res

		components.map((component) => {
			let componentStyle = component.shadowRoot.querySelector('style')
			if (componentStyle) {
				componentStyle.textContent = globalStyle + '\n' + componentStyle.textContent
			}
			else {
				componentStyle = component.shadowRoot.insertBefore(document.createElement('style'), component.shadowRoot.firstElementChild)
				componentStyle.textContent = globalStyle
			}
			ZION(component)
		})

		function onRouteChanged() {
			const hash = window.location.hash

			localStorage.setItem('app.lastHash', hash)

			if (!(app instanceof HTMLElement)) {
				throw new ReferenceError('No router view element available for rendering')
			}

			const view = new routes[hash.split('?')[0]]()

			let viewStyle = view.shadowRoot.querySelector('style')
			if (viewStyle) {
				viewStyle.textContent = globalStyle + '\n' + viewStyle.textContent
			}
			else {
				viewStyle = view.shadowRoot.insertBefore(document.createElement('style'), view.shadowRoot.firstElementChild)
				viewStyle.textContent = globalStyle
			}

			while (app.firstChild)
				app.removeChild(app.firstChild)
			app.appendChild(view)
			app.view = view

			ZION(app.firstElementChild)
		}

		if (!window.location.hash)
			window.location.hash = '#/'

		onRouteChanged()
		window.addEventListener('hashchange', onRouteChanged)
	})
