export default class Confirm extends HTMLElement {
	constructor() {
		super()

		this.attachShadow({mode: 'open'})

		const link = this.shadowRoot.appendChild(document.createElement('link'))
		link.rel = 'stylesheet'
		link.href = 'app.css'

		const style = this.shadowRoot.appendChild(document.createElement('style'))
		style.textContent = /*css*/`
			#wrapper {
				position: fixed;
				inset: 73px 0 0;
				z-index: 8;
				display: none;
				justify-content: center;
				align-items: flex-start;
			}

			#shadow {
				z-index: 1;
				position: fixed;
				top: 0;
				left: 0;
				width: 100%;
				height: 100vh;
				background: var(--transparentBg);
			}

			#confirm {
				z-index: 2;
				padding: 7px;
				width: 90%;
				max-width: 400px;
				background: var(--darkgray3);
				border-radius: .3rem;
				box-shadow: 0 0 5px var(--transparentBg);
				user-select: none;
			}

			#header {
				border-radius: .3rem .3rem 0 0;
				font-size: 1.2em;
				font-weight: bold;
				color: var(--gray3);
				padding-left: 8px;
			}

			#section {
				padding: 24px 8px;
				color: var(--gray3);
			}

			#footer {
				display: flex;
				gap: 5px;
			}

			#footer button {
				flex: 1;
				margin: 0;
			}

			@keyframes fadeIn {
				from {
					opacity: 0;
				}
			}

			@keyframes fadeOut {
				to {
					opacity: 0;
				}
			}

			@keyframes rollIn {
				from {
					transform: translateY(-500px);
				}
			}

			@keyframes rollOut {
				to {
					transform: translateY(-500px);
				}
			}
		`

		const wrapper = this.shadowRoot.appendChild(document.createElement('div'))
		wrapper.id = 'wrapper'

		const shadow = wrapper.appendChild(document.createElement('div'))
		shadow.id = 'shadow'

		const confirm = wrapper.appendChild(document.createElement('div'))
		confirm.id = 'confirm'

		const header = confirm.appendChild(document.createElement('header'))
		header.id = 'header'
		header.innerText = 'Cabeçalho'

		const section = confirm.appendChild(document.createElement('section'))
		section.id = 'section'
		section.innerText = 'Seção'

		const footer = confirm.appendChild(document.createElement('footer'))
		footer.id = 'footer'

		const yBt = footer.appendChild(document.createElement('button'))
		yBt.id = 'yBt'
		yBt.classList.add('blueBt')
		yBt.innerText = 'Sim'

		const nBt = footer.appendChild(document.createElement('button'))
		nBt.id = 'nBt'
		nBt.innerText = 'Não'

		this.confirm = async (title, msg) => {
			wrapper.style.display = 'flex'
			shadow.style.animation = 'fadeIn .2s linear'
			confirm.style.animation = 'rollIn .2s ease-in-out'
			header.innerText = title || 'Confirme'
			section.innerHTML = msg || 'Deseja mesmo fazer isso?'
			yBt.focus()
			return new Promise((res) => {
				yBt.onclick = () => {
					this.hide()
					res(true)
				}

				nBt.onclick = () => {
					this.hide()
					res(false)
				}
			})
		}

		this.hide = () => {
			const removeWrapper = () => {
				this.shadowRoot.removeEventListener('animationend', removeWrapper)
				wrapper.style.display = 'none'
			}

			const removeConfirm = () => {
				this.shadowRoot.removeEventListener('animationend', removeConfirm)
				confirm.style.animation = 'rollOut .4s ease-out forwards'
				this.shadowRoot.addEventListener('animationend', removeWrapper)
			}
			shadow.style.animation = 'fadeOut .2s linear forwards'
			this.shadowRoot.addEventListener('animationend', removeConfirm)
		}

		this.onkeydown = (e) => {
			if (e.key == 'Enter')
				yBt.click()
			else if (e.key == 'Escape')
				nBt.click()
		}
	}
}

customElements.define('zion-confirm', Confirm)