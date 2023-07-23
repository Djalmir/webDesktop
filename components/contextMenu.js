const style = document.createElement('style')
style.textContent = /*css*/`
	nav {
		position: absolute;
		display: flex;
		flex-direction: column;
		background: var(--dark-bg3);
		padding: 3px;
		gap: 3px;
		border-radius: .3rem;
		z-index: 6;
		box-shadow: 0 0 2px var(--light-bg4);
	}

	button {
		margin: 0;
		background: var(--dark-bg2);
		color: var(--light-bg1);
	}

	@keyframes grow {
		from {
			transform-origin: top left;
			transform: scale(0);
		}
	}

	@keyframes fadeOut {
		to {
			opacity: 0;
			transform: translate(10%, 20%);
		}
	}
`
const template = document.createElement('template')
template.innerHTML = /*html*/`
	<nav z-if="showing" enter-animation="grow .2s ease-out" leave-animation="fadeOut .4s ease-in-out">
	</nav>
`

export default class ContextMenu extends HTMLElement {
	constructor() {
		super()
		this.attachShadow({mode: 'open'})
		this.shadowRoot.appendChild(style.cloneNode(true))
		this.shadowRoot.appendChild(template.content.cloneNode(true))

		this.showing = false

		this.show = (items, left, top) => {
			let nav = this.shadowRoot.querySelector('nav')
			this.items = null
			while (nav.firstElementChild)
				nav.removeChild(nav.firstElementChild)

			this.items = items

			nav.style.left = left + 'px'
			nav.style.top = top + 'px'

			this.items.map((item) => {
				let button = nav.appendChild(document.createElement('button'))
				button.innerText = item.text
				button.onclick = () => item.action(left, top)
			})
			this.showing = true
		}

		this.close = () => {
			this.showing = false
			document.body.removeEventListener('click', this.close)
		}
	}
}

customElements.define('zion-context-menu', ContextMenu)