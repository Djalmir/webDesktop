export default class ErrorMsgs extends HTMLElement {
	constructor() {
		super()

		const shadow = this.attachShadow({mode: 'open'})

		const link = shadow.appendChild(document.createElement('link'))
		link.rel = 'stylesheet'
		link.href = 'app.css'

		const style = shadow.appendChild(document.createElement('style'))
		style.textContent = /*css*/`
			#errorMsgsContainer {
				position: fixed;
				top: 0;
				right: 0;
				display: flex;
				flex-direction: column;
				align-items: flex-end;
				gap: 5px;
				padding: 5px;
				z-index: 6;
			}

			.errorMsg {
				box-sizing: border-box;
				background: var(--dark-bg1);
				display: flex;
				align-items: center;
				gap: 15px;
				padding: 7px 14px;
				box-sizing: border-box;
				transition: .2s;
				border-radius: .2rem;
				border-left: 1px solid var(--dark-bg3);
				border-top: 1px solid var(--dark-bg3);
				border-right: 1px solid var(--dark-bg0);
				border-bottom: 1px solid var(--dark-bg0);
			}
			
			.errorMsgText {
				flex: 1;
				font-weight: bolder;
				color: var(--danger-light);
			}
			
			.closeErrorBtn {
				width: 32px;
				height: 32px;
				border-radius: 30%;
				background: var(--dark-bg2);
				cursor: pointer;
				display: flex;
				align-items: center;
				border-left: 1px solid var(--secondary);
				border-top: 1px solid var(--secondary);
				border-right: 1px solid var(--dark-bg0);
				border-bottom: 1px solid var(--dark-bg0);
				filter: brightness(.8);
			}

			.closeErrorBtn:hover,
			.closeErrorBtn:focus {
				filter: brightness(1);
			}

			.closeErrorBtn:active {
				filter: brightness(.8);
				border-left: 1px solid var(--dark-bg0);
				border-top: 1px solid var(--dark-bg0);
				border-right: 1px solid var(--dark-font2);
				border-bottom: 1px solid var(--dark-font2);
			}

			.closeErrorBtn svg {
				stroke: var(--danger-light);
				stroke-width: 3;
				stroke-linecap: round;
			}

			button {
				margin: 0;
			}

			@keyframes show {
				from {
					transform: translateX(125%);
				}

				to {
					transform: translateX(0);
				}
			}

			@keyframes hide {
				from {
					transform: translateX(0);
				}

				to {
					transform: translateX(125%);
				}
			}

			@keyframes atention {
				0% {
					transform: rotateZ(0);
				}
				25% {
					transform: rotateZ(5deg);
				}
				50%{
					transform: rotateZ(-5deg);
				}
				75% {
					transform: rotateZ(5deg);
				}
				100% {
					transform: rotateZ(0);
				}
			}
		`

		const wrapper = shadow.appendChild(document.createElement('div'))
		wrapper.id = 'errorMsgsContainer'

		this.getMessages = () => {
			if (wrapper.children) {
				return Array.from(wrapper.children)
			}
			return false
		}

		this.show = (error) => {
			let existingMsg
			if (error.field)
				existingMsg = Array.from(wrapper.children).find(msg => msg.field == error.field)
			else
				existingMsg = Array.from(wrapper.children).find(msg => msg.firstChild.textContent == error.message)

			if (existingMsg) {
				existingMsg.closeMsg()
			}

			const errorMsg = wrapper.insertBefore(document.createElement('div'), wrapper.children[0])
			errorMsg.classList.add('errorMsg')
			errorMsg.field = error.field

			const errorMsgText = errorMsg.appendChild(document.createElement('span'))
			errorMsgText.classList.add('errorMsgText')
			errorMsgText.textContent = error.message

			const closeErrorBtn = errorMsg.appendChild(document.createElement('button'))
			closeErrorBtn.classList.add('closeErrorBtn')
			closeErrorBtn.onclick = () => {errorMsg.closeMsg()}
			closeErrorBtn.innerHTML = `
				<svg viewBox="0 0 20 20">
					<line x1="5" y1="5" x2="15" y2="15" />
					<line x1="5" y1="15" x2="15" y2="5" />
				</svg>
			`

			errorMsg.style.animation = 'show .2s ease-out 1'

			errorMsg.closeMsg = () => {
				errorMsg.style.animation = 'hide .2s ease-in 1 forwards'
				wrapper.addEventListener('animationend', removeMsg)
			}

			const removeMsg = () => {
				wrapper.removeEventListener('animationend', removeMsg)
				wrapper.removeChild(errorMsg)
			}
		}

		this.closeMsg = (child) => {
			const removeMsg = () => {
				wrapper.removeEventListener('animationend', removeMsg)
				wrapper.removeChild(child)
			}
			child.style.animation = 'hide .2s ease-in 1 forwards'
			wrapper.addEventListener('animationend', removeMsg)
		}

		this.closeAll = () => {
			Array.from(wrapper.children).map((errorMsg) => {
				errorMsg.closeMsg()
			})
		}

		this.callAttention = () => {
			navigator.vibrate(['100', '50', '150','50','50'])
			Array.from(wrapper.children).map((errorMsg) => {
				const removeAnimation = () => {
					errorMsg.style.animation = ''
					errorMsg.removeEventListener('animationend', removeAnimation)
				}
				errorMsg.style.animation = 'atention .2s linear 2'
				errorMsg.addEventListener('animationend', removeAnimation)
			})
		}
	}
}

customElements.define('error-msgs', ErrorMsgs)